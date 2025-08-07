package org.aquastream.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/**
 * Simple JWT authentication filter for Spring Cloud Gateway.
 * <p>
 * Checks the presence of the {@code Authorization} header and ensures it
 * follows the {@code Bearer} scheme. Full token validation is intentionally
 * minimal and should be enhanced in the future.
 */
@Component
public class JwtAuthenticationGatewayFilterFactory extends AbstractGatewayFilterFactory<JwtAuthenticationGatewayFilterFactory.Config> {

    public JwtAuthenticationGatewayFilterFactory() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }
            return chain.filter(exchange);
        };
    }

    /**
     * Configuration class for the {@link JwtAuthenticationGatewayFilterFactory}.
     * <p>
     * Currently empty but reserved for future use where additional settings may
     * be required for token validation.
     */
    public static class Config {
    }
}
