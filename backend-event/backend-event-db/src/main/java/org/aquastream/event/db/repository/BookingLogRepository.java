package org.aquastream.event.db.repository;

import org.aquastream.event.db.entity.BookingLogEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Repository for booking audit logs.
 */
@Repository
public interface BookingLogRepository extends JpaRepository<BookingLogEntity, UUID> {
    
    /**
     * Find all logs for a specific booking ordered by creation time
     */
    List<BookingLogEntity> findByBookingIdOrderByCreatedAtDesc(UUID bookingId);
    
    /**
     * Find logs for a booking with pagination
     */
    Page<BookingLogEntity> findByBookingIdOrderByCreatedAtDesc(UUID bookingId, Pageable pageable);
    
    /**
     * Find logs by actor (user who performed actions)
     */
    Page<BookingLogEntity> findByActorUserIdOrderByCreatedAtDesc(UUID actorUserId, Pageable pageable);
    
    /**
     * Find logs for a specific action type
     */
    List<BookingLogEntity> findByActionOrderByCreatedAtDesc(BookingLogEntity.BookingLogAction action);
    
    /**
     * Find recent logs for monitoring/debugging
     */
    @Query("SELECT bl FROM BookingLogEntity bl " +
           "WHERE bl.createdAt >= :since " +
           "ORDER BY bl.createdAt DESC")
    List<BookingLogEntity> findRecentLogs(@Param("since") Instant since);
    
    /**
     * Find logs for bookings of a specific event (for organizer audit)
     */
    @Query("SELECT bl FROM BookingLogEntity bl " +
           "JOIN bl.booking b " +
           "WHERE b.event.id = :eventId " +
           "ORDER BY bl.createdAt DESC")
    Page<BookingLogEntity> findByEventId(@Param("eventId") UUID eventId, Pageable pageable);
    
    /**
     * Count logs for analytics
     */
    @Query("SELECT COUNT(bl) FROM BookingLogEntity bl " +
           "WHERE bl.createdAt >= :since " +
           "AND bl.action = :action")
    long countLogsByActionSince(@Param("action") BookingLogEntity.BookingLogAction action, 
                               @Param("since") Instant since);
}