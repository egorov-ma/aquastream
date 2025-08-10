package org.aquastream.gateway.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import io.github.bucket4j.ConsumptionProbe;
import org.aquastream.common.domain.DomainConstants;
import org.aquastream.common.error.ProblemDetails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter implements GlobalFilter, Ordered {

    private final int defaultPerMinute;
    private final int loginPerMinute;
    private final int recoveryPerMinute;
    private final Map<String, Bucket> limiter = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RateLimitFilter(
            @Value("${gateway.rate-limit.default-per-minute:60}") int defaultPerMinute,
            @Value("${gateway.rate-limit.login-per-minute:10}") int loginPerMinute,
            @Value("${gateway.rate-limit.recovery-per-minute:5}") int recoveryPerMinute
    ) {
        this.defaultPerMinute = defaultPerMinute;
        this.loginPerMinute = loginPerMinute;
        this.recoveryPerMinute = recoveryPerMinute;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String category = resolveCategory(exchange.getRequest().getURI().getPath());
        String key = category + ":" + resolveClientKey(exchange);
        Bucket bucket = limiter.computeIfAbsent(key, k -> newBucketFor(category));
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        if (probe.isConsumed()) {
            exchange.getResponse().getHeaders().add("X-RateLimit-Remaining", String.valueOf(probe.getRemainingTokens()));
            return chain.filter(exchange);
        }

        long nanosToWait = probe.getNanosToWaitForRefill();
        long seconds = Math.max(1L, (long) Math.ceil(nanosToWait / 1_000_000_000.0));
        exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        exchange.getResponse().getHeaders().add(HttpHeaders.RETRY_AFTER, String.valueOf(seconds));
        exchange.getResponse().getHeaders().setContentType(MediaType.valueOf(ProblemDetails.MEDIA_TYPE));

        ProblemDetails pd = new ProblemDetails();
        pd.setType(URI.create("https://aquastream.app/problems/429"));
        pd.setTitle(HttpStatus.TOO_MANY_REQUESTS.getReasonPhrase());
        pd.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        pd.setDetail("Rate limit exceeded");
        pd.setCode("rate.limit-exceeded");
        pd.setInstance(exchange.getRequest().getURI().getPath());
        String corr = exchange.getRequest().getHeaders().getFirst(DomainConstants.HEADER_REQUEST_ID);
        if (corr != null && !corr.isBlank()) pd.setCorrelationId(corr);

        try {
            byte[] body = objectMapper.writeValueAsBytes(pd);
            return exchange.getResponse().writeWith(Mono.just(exchange.getResponse()
                    .bufferFactory().wrap(body)));
        } catch (Exception e) {
            byte[] fallback = "{}".getBytes(StandardCharsets.UTF_8);
            return exchange.getResponse().writeWith(Mono.just(exchange.getResponse()
                    .bufferFactory().wrap(fallback)));
        }
    }

    private String resolveCategory(String path) {
        if (path.startsWith("/api/v1/auth/recovery")) return "recovery";
        if (path.startsWith("/api/v1/auth/login")) return "login";
        return "default";
    }

    private String resolveClientKey(ServerWebExchange exchange) {
        String ip = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
        if (ip == null || ip.isBlank()) {
            if (exchange.getRequest().getRemoteAddress() != null && exchange.getRequest().getRemoteAddress().getAddress() != null) {
                ip = exchange.getRequest().getRemoteAddress().getAddress().getHostAddress();
            } else {
                ip = "unknown";
            }
        }
        return ip;
    }

    private Bucket newBucketFor(String category) {
        int limit = switch (category) {
            case "login" -> loginPerMinute;
            case "recovery" -> recoveryPerMinute;
            default -> defaultPerMinute;
        };
        Bandwidth bandwidth = Bandwidth.classic(limit, Refill.greedy(limit, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(bandwidth).build();
    }

    @Override
    public int getOrder() {
        return -10; // run early
    }
}


