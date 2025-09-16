package org.aquastream.gateway.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * JWT Authentication WebFilter for Gateway.
 * 
 * This filter validates JWT tokens and adds user context headers for downstream services.
 * It runs on all requests except authentication endpoints.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthWebFilter implements WebFilter {
    
    private final JwtUtil jwtUtil;
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getPath().value();
        
        // Skip JWT validation for authentication endpoints
        if (shouldSkipAuthentication(path)) {
            return chain.filter(exchange);
        }
        
        // Extract JWT token from request
        String token = extractToken(exchange);
        if (token == null) {
            log.debug("No JWT token found in request to {}", path);
            return unauthorized(exchange);
        }
        
        // Validate token and extract user info
        JwtUtil.JwtUserInfo userInfo = jwtUtil.validateToken(token);
        if (userInfo == null) {
            log.debug("Invalid JWT token for request to {}", path);
            return unauthorized(exchange);
        }
        
        // Add user context headers for downstream services
        ServerWebExchange modifiedExchange = exchange.mutate()
                .request(builder -> builder
                        .header("X-User-Id", userInfo.getUserIdAsString())
                        .header("X-User-Role", userInfo.role())
                )
                .build();
        
        log.debug("JWT validation successful for user {} accessing {}", userInfo.userId(), path);
        return chain.filter(modifiedExchange);
    }
    
    /**
     * Determines if JWT authentication should be skipped for the given path.
     */
    private boolean shouldSkipAuthentication(String path) {
        return path.startsWith("/api/v1/auth/") || 
               path.equals("/actuator/health") ||
               path.startsWith("/actuator/");
    }
    
    /**
     * Extracts JWT token from Authorization header or cookies.
     */
    private String extractToken(ServerWebExchange exchange) {
        // Try Authorization header first
        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
        String token = jwtUtil.extractTokenFromAuthorizationHeader(authHeader);
        if (token != null) {
            return token;
        }
        
        // Try cookies as fallback
        String cookieValue = exchange.getRequest().getCookies().getFirst("access")
                != null ? exchange.getRequest().getCookies().getFirst("access").getValue() : null;
        return jwtUtil.extractTokenFromCookie(cookieValue);
    }
    
    /**
     * Returns 401 Unauthorized response.
     */
    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }
}