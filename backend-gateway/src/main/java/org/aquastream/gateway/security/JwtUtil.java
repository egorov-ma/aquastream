package org.aquastream.gateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.util.UUID;

/**
 * JWT utility for token validation in Gateway.
 * 
 * This utility validates JWT tokens created by user-service using the same secret key.
 * It extracts user information without requiring database access.
 */
@Component
@Slf4j
public class JwtUtil {
    
    @Value("${app.jwt.secret:dev-secret-change-me}")
    private String jwtSecret;
    
    /**
     * Validates JWT token and extracts user information.
     * 
     * @param token JWT token to validate
     * @return JwtUserInfo if token is valid, null if invalid
     */
    public JwtUserInfo validateToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            return null;
        }
        
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(new SecretKeySpec(jwtSecret.getBytes(), "HmacSHA512"))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            
            String subject = claims.getSubject();
            String role = claims.get("role", String.class);
            
            if (subject == null || role == null) {
                log.debug("JWT token missing required claims: subject={}, role={}", subject, role);
                return null;
            }
            
            UUID userId;
            try {
                userId = UUID.fromString(subject);
            } catch (IllegalArgumentException e) {
                log.debug("Invalid UUID format in JWT subject: {}", subject);
                return null;
            }
            
            return new JwtUserInfo(userId, role);
            
        } catch (ExpiredJwtException e) {
            log.debug("JWT token expired: {}", e.getMessage());
            return null;
        } catch (UnsupportedJwtException e) {
            log.debug("Unsupported JWT token: {}", e.getMessage());
            return null;
        } catch (MalformedJwtException e) {
            log.debug("Malformed JWT token: {}", e.getMessage());
            return null;
        } catch (JwtException e) {
            log.debug("JWT token validation failed: {}", e.getMessage());
            return null;
        } catch (Exception e) {
            log.debug("Unexpected error during JWT validation: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * Extracts JWT token from Authorization header.
     * Supports both "Bearer <token>" and direct token formats.
     * 
     * @param authorizationHeader Authorization header value
     * @return JWT token or null if not found
     */
    public String extractTokenFromAuthorizationHeader(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.trim().isEmpty()) {
            return null;
        }
        
        if (authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7).trim();
        }
        
        // Support direct token format (without "Bearer" prefix)
        return authorizationHeader.trim();
    }
    
    /**
     * Extracts JWT token from cookie value.
     * 
     * @param cookieValue Cookie value containing JWT token
     * @return JWT token or null if not found
     */
    public String extractTokenFromCookie(String cookieValue) {
        if (cookieValue == null || cookieValue.trim().isEmpty()) {
            return null;
        }
        
        return cookieValue.trim();
    }
    
    /**
     * Data class representing validated JWT user information.
     */
    public record JwtUserInfo(UUID userId, String role) {
        
        /**
         * Get user ID as string for headers.
         */
        public String getUserIdAsString() {
            return userId.toString();
        }
        
        /**
         * Get role with ROLE_ prefix for Spring Security.
         */
        public String getRoleWithPrefix() {
            return "ROLE_" + role;
        }
    }
}