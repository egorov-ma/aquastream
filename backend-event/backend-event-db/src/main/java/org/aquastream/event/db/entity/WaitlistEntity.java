package org.aquastream.event.db.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "waitlist", schema = "event",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"event_id", "user_id"}),
           @UniqueConstraint(columnNames = {"event_id", "priority"})
       })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WaitlistEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "event_id", nullable = false)
    private UUID eventId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "priority", nullable = false)
    private Integer priority;

    @Column(name = "notified_at")
    private Instant notifiedAt;

    @Column(name = "notification_expires_at")
    private Instant notificationExpiresAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", insertable = false, updatable = false)
    private EventEntity event;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }
}