package org.aquastream.user.service;

import org.aquastream.user.db.entity.RefreshSessionEntity;
import org.aquastream.user.db.repo.RefreshSessionRepository;
import org.aquastream.user.db.repo.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceRefreshTest {
    
    @Mock
    private UserRepository users;
    
    @Mock
    private RefreshSessionRepository refreshSessions;
    
    @Mock
    private PasswordEncoder encoder;
    
    @InjectMocks
    private AuthService authService;
    
    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "jwtSecretStr", "test-secret-key-for-refresh-token-testing");
        ReflectionTestUtils.setField(authService, "refreshTtlSeconds", 2592000L); // 30 days
    }
    
    @Test
    void revokeAllUserSessions_Success() {
        // Given
        UUID userId = UUID.randomUUID();
        when(refreshSessions.deleteByUserId(userId)).thenReturn(3L);
        
        // When
        int result = authService.revokeAllUserSessions(userId);
        
        // Then
        assertEquals(3, result);
        verify(refreshSessions).deleteByUserId(userId);
    }
    
    @Test
    void cleanupExpiredSessions_WithExpiredSessions_Success() {
        // Given
        Instant now = Instant.now();
        UUID userId1 = UUID.randomUUID();
        UUID userId2 = UUID.randomUUID();
        
        RefreshSessionEntity expired1 = RefreshSessionEntity.builder()
                .jti("expired1")
                .userId(userId1)
                .issuedAt(now.minusSeconds(86400)) // 1 day ago
                .expiresAt(now.minusSeconds(3600)) // 1 hour ago (expired)
                .build();
        
        RefreshSessionEntity expired2 = RefreshSessionEntity.builder()
                .jti("expired2")
                .userId(userId2)
                .issuedAt(now.minusSeconds(172800)) // 2 days ago
                .expiresAt(now.minusSeconds(7200)) // 2 hours ago (expired)
                .build();
        
        List<RefreshSessionEntity> expiredSessions = List.of(expired1, expired2);
        when(refreshSessions.findByExpiresAtBeforeAndRevokedAtIsNull(any(Instant.class)))
                .thenReturn(expiredSessions);
        when(refreshSessions.save(any(RefreshSessionEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        
        // When
        int result = authService.cleanupExpiredSessions();
        
        // Then
        assertEquals(2, result);
        verify(refreshSessions, times(2)).save(any(RefreshSessionEntity.class));
        
        // Verify that sessions were marked as revoked
        assertNotNull(expired1.getRevokedAt());
        assertNotNull(expired2.getRevokedAt());
    }
    
    @Test
    void cleanupExpiredSessions_NoExpiredSessions_ReturnsZero() {
        // Given
        when(refreshSessions.findByExpiresAtBeforeAndRevokedAtIsNull(any(Instant.class)))
                .thenReturn(List.of());
        
        // When
        int result = authService.cleanupExpiredSessions();
        
        // Then
        assertEquals(0, result);
        verify(refreshSessions, never()).save(any());
    }
    
    @Test
    void issueRefreshSession_CreatesNewSession() {
        // Given
        UUID userId = UUID.randomUUID();
        RefreshSessionEntity expectedSession = RefreshSessionEntity.builder()
                .jti("test-jti")
                .userId(userId)
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(2592000))
                .build();
        
        when(refreshSessions.save(any(RefreshSessionEntity.class))).thenReturn(expectedSession);
        
        // When
        RefreshSessionEntity result = authService.issueRefreshSession(userId);
        
        // Then
        assertNotNull(result);
        assertEquals("test-jti", result.getJti());
        assertEquals(userId, result.getUserId());
        verify(refreshSessions).save(any(RefreshSessionEntity.class));
    }
    
    @Test
    void revokeRefresh_ExistingSession_MarksAsRevoked() {
        // Given
        String jti = "test-jti";
        RefreshSessionEntity session = RefreshSessionEntity.builder()
                .jti(jti)
                .userId(UUID.randomUUID())
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(2592000))
                .build();
        
        when(refreshSessions.findById(jti)).thenReturn(java.util.Optional.of(session));
        when(refreshSessions.save(any(RefreshSessionEntity.class))).thenReturn(session);
        
        // When
        authService.revokeRefresh(jti);
        
        // Then
        assertNotNull(session.getRevokedAt());
        verify(refreshSessions).save(session);
    }
    
    @Test
    void revokeRefresh_NonExistentSession_DoesNothing() {
        // Given
        String jti = "non-existent-jti";
        when(refreshSessions.findById(jti)).thenReturn(java.util.Optional.empty());
        
        // When
        authService.revokeRefresh(jti);
        
        // Then
        verify(refreshSessions, never()).save(any());
    }
}