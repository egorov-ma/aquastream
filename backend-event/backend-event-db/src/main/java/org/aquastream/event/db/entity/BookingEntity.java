package org.aquastream.event.db.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.aquastream.common.domain.BookingStatus;
import org.aquastream.common.domain.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Booking entity representing a user's booking for an event.
 * 
 * Business rules:
 * - PENDING bookings auto-expire after 30 minutes
 * - One booking per user per event (unique constraint)
 * - Amount is locked at booking time (may differ from current event price)
 * - Payment status is independent of booking status
 */
@Entity
@Table(name = "bookings", schema = "event")
@Data
@EqualsAndHashCode(callSuper = false)
@ToString(exclude = {"event"}) // Avoid circular references in toString
public class BookingEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private EventEntity event;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BookingStatus status = BookingStatus.PENDING;
    
    @Column(name = "amount", precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus = PaymentStatus.NOT_REQUIRED;
    
    @Column(name = "payment_id")
    private UUID paymentId;
    
    @Column(name = "expires_at")
    private Instant expiresAt;
    
    @Column(name = "created_by")
    private UUID createdBy;
    
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (updatedAt == null) {
            updatedAt = createdAt;
        }
        
        // Set expiration for PENDING bookings (30 minutes)
        if (status == BookingStatus.PENDING && expiresAt == null) {
            expiresAt = createdAt.plusSeconds(30 * 60); // 30 minutes
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
    
    /**
     * Check if this booking has expired (only applicable for PENDING status)
     */
    public boolean isExpired() {
        return status == BookingStatus.PENDING 
            && expiresAt != null 
            && Instant.now().isAfter(expiresAt);
    }
    
    /**
     * Check if this booking requires payment
     */
    public boolean requiresPayment() {
        return amount != null && amount.compareTo(BigDecimal.ZERO) > 0;
    }
    
    /**
     * Check if booking can be confirmed (has valid payment if required)
     */
    public boolean canBeConfirmed() {
        if (status != BookingStatus.PENDING) {
            return false;
        }
        
        if (requiresPayment()) {
            return paymentStatus == PaymentStatus.SUCCEEDED;
        }
        
        return true; // Free events can be confirmed immediately
    }
}