package org.aquastream.gateway.filter;

import org.aquastream.common.domain.DomainConstants;
import org.aquastream.common.util.Ids;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Component
public class CorrelationWebFilter implements WebFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String cid = exchange.getRequest().getHeaders().getFirst(DomainConstants.HEADER_REQUEST_ID);
        if (cid == null || cid.isBlank()) {
            cid = Ids.newIdempotencyKey();
        }
        exchange.getResponse().getHeaders().add(DomainConstants.HEADER_REQUEST_ID, cid);
        ServerHttpRequest mutated = exchange.getRequest().mutate()
                .header(DomainConstants.HEADER_REQUEST_ID, cid)
                .build();
        return chain.filter(exchange.mutate().request(mutated).build());
    }

    @Override
    public int getOrder() {
        return -20; // run before rate-limit
    }
}


