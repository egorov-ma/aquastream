package org.aquastream.user.db.repository;

import org.aquastream.user.db.entity.RefreshSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface RefreshSessionRepository extends JpaRepository<RefreshSessionEntity, String> {
    
    /**
     * Delete all sessions for a user.
     * Used when user account is deleted or password is reset.
     */
    long deleteByUserId(UUID userId);
    
    /**
     * Find expired sessions that haven't been revoked yet.
     */
    List<RefreshSessionEntity> findByExpiresAtBeforeAndRevokedAtIsNull(Instant expiredBefore);
    
    /**
     * Count active sessions for a user.
     */
    @Query("SELECT COUNT(r) FROM RefreshSessionEntity r WHERE r.userId = :userId AND r.revokedAt IS NULL AND r.expiresAt > :now")
    long countActiveSessionsByUserId(@Param("userId") UUID userId, @Param("now") Instant now);
    
    /**
     * Find active sessions for a user.
     */
    @Query("SELECT r FROM RefreshSessionEntity r WHERE r.userId = :userId AND r.revokedAt IS NULL AND r.expiresAt > :now ORDER BY r.issuedAt DESC")
    List<RefreshSessionEntity> findActiveSessionsByUserId(@Param("userId") UUID userId, @Param("now") Instant now);
}


