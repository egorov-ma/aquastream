package org.aquastream.event.db.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "waitlist_audit", schema = "event")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WaitlistAuditEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "event_id", nullable = false)
    private UUID eventId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "action", nullable = false, length = 50)
    private String action; // JOINED, LEFT, NOTIFIED, CONFIRMED, EXPIRED

    @Column(name = "priority_before")
    private Integer priorityBefore;

    @Column(name = "priority_after")
    private Integer priorityAfter;

    @Column(name = "total_in_queue")
    private Long totalInQueue;

    @Column(name = "notification_expires_at")
    private Instant notificationExpiresAt;

    @Column(name = "metadata", columnDefinition = "text")
    private String metadata; // Additional context in JSON format

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }
}