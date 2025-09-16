package org.aquastream.gateway.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.spec.SecretKeySpec;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {
    
    private JwtUtil jwtUtil;
    private final String jwtSecret = "test-secret-key-for-jwt-validation-that-is-long-enough-for-hs512-algorithm";
    
    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "jwtSecret", jwtSecret);
    }
    
    @Test
    void validateToken_ValidToken_ReturnsUserInfo() {
        // Given
        UUID userId = UUID.randomUUID();
        String role = "USER";
        
        String token = createValidJwt(userId, role, Instant.now().plusSeconds(900));
        
        // When
        JwtUtil.JwtUserInfo userInfo = jwtUtil.validateToken(token);
        
        // Then
        assertNotNull(userInfo);
        assertEquals(userId, userInfo.userId());
        assertEquals(role, userInfo.role());
    }
    
    @Test
    void validateToken_ExpiredToken_ReturnsNull() {
        // Given
        UUID userId = UUID.randomUUID();
        String role = "USER";
        
        String token = createValidJwt(userId, role, Instant.now().minusSeconds(60));
        
        // When
        JwtUtil.JwtUserInfo userInfo = jwtUtil.validateToken(token);
        
        // Then
        assertNull(userInfo);
    }
    
    @Test
    void validateToken_InvalidToken_ReturnsNull() {
        // Given
        String invalidToken = "invalid.jwt.token";
        
        // When
        JwtUtil.JwtUserInfo userInfo = jwtUtil.validateToken(invalidToken);
        
        // Then
        assertNull(userInfo);
    }
    
    @Test
    void validateToken_NullToken_ReturnsNull() {
        // When
        JwtUtil.JwtUserInfo userInfo = jwtUtil.validateToken(null);
        
        // Then
        assertNull(userInfo);
    }
    
    @Test
    void extractTokenFromAuthorizationHeader_BearerToken_ExtractsToken() {
        // Given
        String token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.test";
        String authHeader = "Bearer " + token;
        
        // When
        String extracted = jwtUtil.extractTokenFromAuthorizationHeader(authHeader);
        
        // Then
        assertEquals(token, extracted);
    }
    
    @Test
    void extractTokenFromAuthorizationHeader_DirectToken_ExtractsToken() {
        // Given
        String token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.test";
        
        // When
        String extracted = jwtUtil.extractTokenFromAuthorizationHeader(token);
        
        // Then
        assertEquals(token, extracted);
    }
    
    @Test
    void extractTokenFromAuthorizationHeader_NullHeader_ReturnsNull() {
        // When
        String extracted = jwtUtil.extractTokenFromAuthorizationHeader(null);
        
        // Then
        assertNull(extracted);
    }
    
    private String createValidJwt(UUID userId, String role, Instant expiration) {
        return Jwts.builder()
                .subject(userId.toString())
                .claim("role", role)
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(expiration))
                .signWith(new SecretKeySpec(jwtSecret.getBytes(), "HmacSHA512"))
                .compact();
    }
}