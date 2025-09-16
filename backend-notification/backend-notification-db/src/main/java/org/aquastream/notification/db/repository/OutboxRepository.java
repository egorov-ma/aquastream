package org.aquastream.notification.db.repository;

import org.aquastream.notification.db.entity.NotificationPrefsEntity;
import org.aquastream.notification.db.entity.OutboxEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface OutboxRepository extends JpaRepository<OutboxEntity, UUID> {

    /**
     * Find messages ready to be sent (pending/failed with retries available)
     */
    @Query("SELECT o FROM OutboxEntity o WHERE " +
           "o.status IN ('PENDING', 'FAILED') AND " +
           "o.attempts < o.maxAttempts AND " +
           "(o.scheduledAt IS NULL OR o.scheduledAt <= :now) AND " +
           "(o.expiresAt IS NULL OR o.expiresAt > :now) " +
           "ORDER BY o.createdAt ASC")
    List<OutboxEntity> findReadyToSend(@Param("now") Instant now, Pageable pageable);

    /**
     * Find failed messages that can be retried
     */
    @Query("SELECT o FROM OutboxEntity o WHERE " +
           "o.status = 'FAILED' AND " +
           "o.attempts < o.maxAttempts AND " +
           "(o.expiresAt IS NULL OR o.expiresAt > :now) " +
           "ORDER BY o.updatedAt ASC")
    List<OutboxEntity> findRetryable(@Param("now") Instant now, Pageable pageable);

    /**
     * Find messages by user ID
     */
    List<OutboxEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);

    /**
     * Find messages by user ID and category
     */
    List<OutboxEntity> findByUserIdAndCategoryOrderByCreatedAtDesc(
            UUID userId, 
            NotificationPrefsEntity.NotificationCategory category);

    /**
     * Find messages by user ID and status
     */
    List<OutboxEntity> findByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, OutboxEntity.OutboxStatus status);

    /**
     * Find messages by status
     */
    Page<OutboxEntity> findByStatusOrderByCreatedAtDesc(OutboxEntity.OutboxStatus status, Pageable pageable);

    /**
     * Find expired messages for cleanup
     */
    @Query("SELECT o FROM OutboxEntity o WHERE o.expiresAt IS NOT NULL AND o.expiresAt < :now")
    List<OutboxEntity> findExpired(@Param("now") Instant now);

    /**
     * Find old processed messages for cleanup (sent/skipped older than retention period)
     */
    @Query("SELECT o FROM OutboxEntity o WHERE " +
           "o.status IN ('SENT', 'SKIPPED') AND " +
           "o.updatedAt < :retentionDate")
    List<OutboxEntity> findOldProcessed(@Param("retentionDate") Instant retentionDate);

    /**
     * Count messages by status
     */
    long countByStatus(OutboxEntity.OutboxStatus status);

    /**
     * Count failed messages by user
     */
    @Query("SELECT COUNT(o) FROM OutboxEntity o WHERE o.userId = :userId AND o.status = 'FAILED'")
    long countFailedByUserId(@Param("userId") UUID userId);

    /**
     * Count pending messages
     */
    @Query("SELECT COUNT(o) FROM OutboxEntity o WHERE o.status = 'PENDING'")
    long countPending();

    /**
     * Find messages scheduled for future delivery
     */
    @Query("SELECT o FROM OutboxEntity o WHERE " +
           "o.scheduledAt IS NOT NULL AND " +
           "o.scheduledAt > :now AND " +
           "o.status = 'PENDING' " +
           "ORDER BY o.scheduledAt ASC")
    List<OutboxEntity> findScheduled(@Param("now") Instant now);

    /**
     * Find messages by category and status (for analytics)
     */
    @Query("SELECT COUNT(o) FROM OutboxEntity o WHERE o.category = :category AND o.status = :status")
    long countByCategoryAndStatus(
            @Param("category") NotificationPrefsEntity.NotificationCategory category,
            @Param("status") OutboxEntity.OutboxStatus status);

    /**
     * Find messages by channel and status (for analytics)
     */
    @Query("SELECT COUNT(o) FROM OutboxEntity o WHERE o.channel = :channel AND o.status = :status")
    long countByChannelAndStatus(
            @Param("channel") NotificationPrefsEntity.NotificationChannel channel,
            @Param("status") OutboxEntity.OutboxStatus status);

    /**
     * Delete old processed messages (for cleanup)
     */
    @Modifying
    @Query("DELETE FROM OutboxEntity o WHERE " +
           "o.status IN ('SENT', 'SKIPPED') AND " +
           "o.updatedAt < :retentionDate")
    int deleteOldProcessed(@Param("retentionDate") Instant retentionDate);

    /**
     * Delete expired messages (for cleanup)
     */
    @Modifying
    @Query("DELETE FROM OutboxEntity o WHERE o.expiresAt IS NOT NULL AND o.expiresAt < :now")
    int deleteExpired(@Param("now") Instant now);

    /**
     * Find messages that exceeded max attempts and should be marked as failed permanently
     */
    @Query("SELECT o FROM OutboxEntity o WHERE " +
           "o.status = 'FAILED' AND " +
           "o.attempts >= o.maxAttempts")
    List<OutboxEntity> findExhaustedRetries();

    /**
     * Update status for exhausted retry messages
     */
    @Modifying
    @Query("UPDATE OutboxEntity o SET o.status = 'FAILED', o.lastError = 'Max retry attempts exceeded' " +
           "WHERE o.status = 'FAILED' AND o.attempts >= o.maxAttempts")
    int markExhaustedRetriesAsPermanentlyFailed();

    /**
     * Find recent activity (for monitoring)
     */
    @Query("SELECT o FROM OutboxEntity o WHERE o.createdAt >= :since ORDER BY o.createdAt DESC")
    List<OutboxEntity> findRecentActivity(@Param("since") Instant since, Pageable pageable);
}