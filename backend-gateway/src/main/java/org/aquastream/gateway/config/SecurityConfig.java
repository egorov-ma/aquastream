package org.aquastream.gateway.config;

import lombok.RequiredArgsConstructor;
import org.aquastream.gateway.security.JwtAuthWebFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

/**
 * Security configuration for Gateway.
 * 
 * Configures JWT authentication filter and security policies.
 */
@Configuration
@EnableWebFluxSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthWebFilter jwtAuthWebFilter;
    
    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(csrf -> csrf.disable())
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .authorizeExchange(exchanges -> exchanges
                        // Allow authentication endpoints
                        .pathMatchers("/api/v1/auth/**").permitAll()
                        // Allow actuator health checks
                        .pathMatchers("/actuator/health", "/actuator/**").permitAll()
                        // All other API endpoints require authentication
                        .pathMatchers("/api/v1/**").authenticated()
                        // Allow other paths (e.g., static resources)
                        .anyExchange().permitAll()
                )
                // Add JWT filter before authentication
                .addFilterBefore(jwtAuthWebFilter, SecurityWebFiltersOrder.AUTHENTICATION)
                .build();
    }
}