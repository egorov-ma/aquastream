package org.aquastream.gateway;

import org.aquastream.gateway.filter.RateLimitFilter;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import reactor.core.publisher.Mono;

import static org.junit.jupiter.api.Assertions.*;

class RateLimitFilterTest {

    @Test
    void returns429WhenExceeded() {
        RateLimitFilter filter = new RateLimitFilter(1, 1, 1);
        MockServerWebExchange ex1 = MockServerWebExchange.from(MockServerHttpRequest.get("/api/v1/auth/login").build());
        MockServerWebExchange ex2 = MockServerWebExchange.from(MockServerHttpRequest.get("/api/v1/auth/login").build());
        GatewayFilterChain pass = exchange -> Mono.empty();

        // 1-я проходит
        filter.filter(ex1, pass).block();
        // 2-я должна быть ограничена
        filter.filter(ex2, pass).block();

        assertEquals(HttpStatus.TOO_MANY_REQUESTS, ex2.getResponse().getStatusCode());
        assertEquals("application/problem+json", ex2.getResponse().getHeaders().getContentType().toString());
        assertTrue(ex2.getResponse().getHeaders().containsKey("Retry-After"));
    }
}


