package org.aquastream.event.db.repository;

import org.aquastream.common.domain.BookingStatus;
import org.aquastream.event.db.entity.BookingEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for booking operations with custom queries for business logic.
 */
@Repository
public interface BookingRepository extends JpaRepository<BookingEntity, UUID> {
    
    /**
     * Find booking by user and event (enforce one booking per user per event)
     */
    Optional<BookingEntity> findByUserIdAndEventId(UUID userId, UUID eventId);
    
    /**
     * Check if user already has an active booking for this event
     */
    boolean existsByUserIdAndEventIdAndStatusIn(UUID userId, UUID eventId, List<BookingStatus> activeStatuses);
    
    /**
     * Find all bookings for a user with pagination
     */
    Page<BookingEntity> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    
    /**
     * Find all bookings for a user with specific status
     */
    Page<BookingEntity> findByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, BookingStatus status, Pageable pageable);
    
    /**
     * Find all bookings for an event (for organizer view)
     */
    Page<BookingEntity> findByEventIdOrderByCreatedAtDesc(UUID eventId, Pageable pageable);
    
    /**
     * Find bookings for an event with specific status
     */
    Page<BookingEntity> findByEventIdAndStatusOrderByCreatedAtDesc(UUID eventId, BookingStatus status, Pageable pageable);
    
    /**
     * Find bookings for organizer across all their events
     */
    @Query("SELECT b FROM BookingEntity b " +
           "JOIN b.event e " +
           "WHERE e.organizer.slug = :organizerSlug " +
           "ORDER BY b.createdAt DESC")
    Page<BookingEntity> findByOrganizerSlug(@Param("organizerSlug") String organizerSlug, Pageable pageable);
    
    /**
     * Find bookings for organizer with specific status
     */
    @Query("SELECT b FROM BookingEntity b " +
           "JOIN b.event e " +
           "WHERE e.organizer.slug = :organizerSlug " +
           "AND b.status = :status " +
           "ORDER BY b.createdAt DESC")
    Page<BookingEntity> findByOrganizerSlugAndStatus(@Param("organizerSlug") String organizerSlug, 
                                                     @Param("status") BookingStatus status, 
                                                     Pageable pageable);
    
    /**
     * Find expired PENDING bookings for automatic cleanup
     */
    @Query("SELECT b FROM BookingEntity b " +
           "WHERE b.status = 'PENDING' " +
           "AND b.expiresAt < :now")
    List<BookingEntity> findExpiredPendingBookings(@Param("now") Instant now);
    
    /**
     * Count active bookings for an event (for capacity management)
     */
    @Query("SELECT COUNT(b) FROM BookingEntity b " +
           "WHERE b.event.id = :eventId " +
           "AND b.status IN ('PENDING', 'CONFIRMED')")
    long countActiveBookingsByEventId(@Param("eventId") UUID eventId);
    
    /**
     * Count confirmed bookings for an event
     */
    long countByEventIdAndStatus(UUID eventId, BookingStatus status);
    
    /**
     * Bulk update booking statuses (for expiration job)
     */
    @Modifying
    @Query("UPDATE BookingEntity b " +
           "SET b.status = :newStatus, b.updatedAt = :updatedAt " +
           "WHERE b.id IN :bookingIds")
    int updateBookingStatuses(@Param("bookingIds") List<UUID> bookingIds, 
                             @Param("newStatus") BookingStatus newStatus,
                             @Param("updatedAt") Instant updatedAt);
    
    /**
     * Find bookings with payment integration for webhook processing
     */
    Optional<BookingEntity> findByPaymentId(UUID paymentId);
    
    /**
     * Find recent bookings for analytics (last N days)
     */
    @Query("SELECT b FROM BookingEntity b " +
           "WHERE b.createdAt >= :since " +
           "ORDER BY b.createdAt DESC")
    List<BookingEntity> findRecentBookings(@Param("since") Instant since);
    
    // ===== ORGANIZER ADMIN METHODS =====
    
    /**
     * Find bookings for organizer by organizer ID (all events)
     */
    @Query("SELECT b FROM BookingEntity b " +
           "JOIN b.event e " +
           "WHERE e.organizer.id = :organizerId " +
           "ORDER BY b.createdAt DESC")
    Page<BookingEntity> findByOrganizerIdOrderByCreatedAtDesc(@Param("organizerId") UUID organizerId, Pageable pageable);
    
    /**
     * Find bookings for organizer by organizer ID and status
     */
    @Query("SELECT b FROM BookingEntity b " +
           "JOIN b.event e " +
           "WHERE e.organizer.id = :organizerId " +
           "AND b.status = :status " +
           "ORDER BY b.createdAt DESC")
    Page<BookingEntity> findByOrganizerIdAndStatusOrderByCreatedAtDesc(
            @Param("organizerId") UUID organizerId, 
            @Param("status") BookingStatus status, 
            Pageable pageable);
    
    /**
     * Find bookings for organizer by organizer ID and event ID
     */
    @Query("SELECT b FROM BookingEntity b " +
           "JOIN b.event e " +
           "WHERE e.organizer.id = :organizerId " +
           "AND b.event.id = :eventId " +
           "ORDER BY b.createdAt DESC")
    Page<BookingEntity> findByOrganizerIdAndEventIdOrderByCreatedAtDesc(
            @Param("organizerId") UUID organizerId, 
            @Param("eventId") UUID eventId, 
            Pageable pageable);
    
    /**
     * Find bookings for organizer by organizer ID, event ID, and status
     */
    @Query("SELECT b FROM BookingEntity b " +
           "JOIN b.event e " +
           "WHERE e.organizer.id = :organizerId " +
           "AND b.event.id = :eventId " +
           "AND b.status = :status " +
           "ORDER BY b.createdAt DESC")
    Page<BookingEntity> findByOrganizerIdAndEventIdAndStatusOrderByCreatedAtDesc(
            @Param("organizerId") UUID organizerId, 
            @Param("eventId") UUID eventId,
            @Param("status") BookingStatus status, 
            Pageable pageable);
    
    /**
     * Get booking statistics by organizer (count by status)
     */
    @Query("SELECT b.status, COUNT(b) FROM BookingEntity b " +
           "JOIN b.event e " +
           "WHERE e.organizer.id = :organizerId " +
           "GROUP BY b.status")
    List<Object[]> getBookingStatisticsByOrganizer(@Param("organizerId") UUID organizerId);
    
    /**
     * Get booking statistics by organizer and specific event (count by status)
     */
    @Query("SELECT b.status, COUNT(b) FROM BookingEntity b " +
           "JOIN b.event e " +
           "WHERE e.organizer.id = :organizerId " +
           "AND b.event.id = :eventId " +
           "GROUP BY b.status")
    List<Object[]> getBookingStatisticsByOrganizerAndEvent(
            @Param("organizerId") UUID organizerId, 
            @Param("eventId") UUID eventId);
    
    /**
     * Get total revenue for organizer's events
     */
    @Query("SELECT COALESCE(SUM(b.amount), 0) FROM BookingEntity b " +
           "JOIN b.event e " +
           "WHERE e.organizer.id = :organizerId " +
           "AND (:eventId IS NULL OR b.event.id = :eventId) " +
           "AND b.status IN ('CONFIRMED', 'COMPLETED')")
    java.math.BigDecimal getTotalRevenueByOrganizer(
            @Param("organizerId") UUID organizerId, 
            @Param("eventId") UUID eventId);
}