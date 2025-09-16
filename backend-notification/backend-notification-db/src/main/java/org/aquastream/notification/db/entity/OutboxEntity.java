package org.aquastream.notification.db.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "outbox", schema = "notification")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class OutboxEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", length = 50, nullable = false)
    private NotificationPrefsEntity.NotificationCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", length = 20, nullable = false)
    private NotificationPrefsEntity.NotificationChannel channel;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload", nullable = false)
    private Map<String, Object> payload;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private OutboxStatus status = OutboxStatus.PENDING;

    @Min(0)
    @Column(name = "attempts", nullable = false)
    @Builder.Default
    private Integer attempts = 0;

    @Min(1)
    @Column(name = "max_attempts", nullable = false)
    @Builder.Default
    private Integer maxAttempts = 3;

    @Column(name = "last_error", columnDefinition = "TEXT")
    private String lastError;

    @Column(name = "scheduled_at")
    private Instant scheduledAt;

    @Column(name = "sent_at")
    private Instant sentAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // Outbox message status
    public enum OutboxStatus {
        PENDING,    // Ready to be sent
        SENT,       // Successfully delivered
        FAILED,     // Failed to deliver (with retries)
        SKIPPED     // Skipped (user preferences disabled, etc.)
    }

    // Helper methods for status management
    public boolean isPending() {
        return status == OutboxStatus.PENDING;
    }

    public boolean isSent() {
        return status == OutboxStatus.SENT;
    }

    public boolean isFailed() {
        return status == OutboxStatus.FAILED;
    }

    public boolean isSkipped() {
        return status == OutboxStatus.SKIPPED;
    }

    public boolean canRetry() {
        return (status == OutboxStatus.PENDING || status == OutboxStatus.FAILED) && 
               attempts < maxAttempts &&
               !isExpired();
    }

    public boolean isExpired() {
        return expiresAt != null && expiresAt.isBefore(Instant.now());
    }

    public boolean isReadyToSend() {
        return canRetry() && 
               (scheduledAt == null || scheduledAt.isBefore(Instant.now()));
    }

    // Mark as sent successfully
    public void markAsSent() {
        this.status = OutboxStatus.SENT;
        this.sentAt = Instant.now();
        this.lastError = null;
    }

    // Mark as failed with error
    public void markAsFailed(String error) {
        this.status = OutboxStatus.FAILED;
        this.lastError = error;
        this.attempts++;
    }

    // Mark as skipped (e.g., user preferences disabled)
    public void markAsSkipped(String reason) {
        this.status = OutboxStatus.SKIPPED;
        this.lastError = reason;
    }

    // Increment retry attempt
    public void incrementAttempt() {
        this.attempts++;
    }

    // Check if should give up retrying
    public boolean shouldGiveUp() {
        return attempts >= maxAttempts || isExpired();
    }
}