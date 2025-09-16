package org.aquastream.event.db.entity;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

/**
 * Booking log entity for audit trail of all booking changes.
 * 
 * Tracks every action performed on bookings including:
 * - Status changes
 * - Payment updates  
 * - Administrative actions
 * - System actions (expiration, etc.)
 */
@Entity
@Table(name = "booking_logs", schema = "event")
@Data
@EqualsAndHashCode(callSuper = false)
public class BookingLogEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private BookingEntity booking;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false)
    private BookingLogAction action;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "old_value", columnDefinition = "jsonb")
    private JsonNode oldValue;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "new_value", columnDefinition = "jsonb")
    private JsonNode newValue;
    
    @Column(name = "actor_user_id")
    private UUID actorUserId;
    
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
    
    /**
     * Enumeration of possible booking log actions
     */
    public enum BookingLogAction {
        CREATED,          // Initial booking creation
        STATUS_CHANGED,   // Booking status updated
        PAYMENT_UPDATED,  // Payment status or payment_id changed
        EXPIRED,          // Booking automatically expired
        CANCELLED,        // Booking cancelled by user/admin
        CONFIRMED,        // Booking confirmed (payment received or free event)
        COMPLETED,        // Booking marked as completed (after event)
        NO_SHOW,          // User didn't show up for event
        AMOUNT_UPDATED    // Booking amount changed (rare, admin action)
    }
}