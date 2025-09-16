package org.aquastream.notification.db.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notification_prefs", schema = "notification")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = {"userId", "category", "channel"})
public class NotificationPrefsEntity {

    @EmbeddedId
    private NotificationPrefsId id;

    @Column(name = "enabled", nullable = false)
    private Boolean enabled = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // Convenience getters for composite key fields
    public UUID getUserId() {
        return id != null ? id.getUserId() : null;
    }

    public NotificationCategory getCategory() {
        return id != null ? id.getCategory() : null;
    }

    public NotificationChannel getChannel() {
        return id != null ? id.getChannel() : null;
    }

    // Composite primary key
    @Embeddable
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationPrefsId {
        
        @Column(name = "user_id", nullable = false)
        private UUID userId;

        @Enumerated(EnumType.STRING)
        @Column(name = "category", length = 50, nullable = false)
        private NotificationCategory category;

        @Enumerated(EnumType.STRING)
        @Column(name = "channel", length = 20, nullable = false)
        private NotificationChannel channel;
    }

    // Notification categories (required and optional)
    public enum NotificationCategory {
        // Required notifications (cannot be disabled)
        BOOKING_CONFIRMED,
        PAYMENT_STATUS,
        EVENT_REMINDER,
        
        // Optional notifications (can be disabled by user)
        WAITLIST_AVAILABLE,
        EVENT_NEWS
    }

    // Notification delivery channels
    public enum NotificationChannel {
        EMAIL,
        SMS,
        TELEGRAM,
        PUSH
    }
}