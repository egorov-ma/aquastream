package org.aquastream.event.db.repository;

import org.aquastream.event.db.entity.WaitlistEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WaitlistRepository extends JpaRepository<WaitlistEntity, UUID> {

    // Find user's position in waitlist for specific event
    Optional<WaitlistEntity> findByEventIdAndUserId(UUID eventId, UUID userId);

    // Get all waitlist entries for event ordered by priority (FIFO)
    List<WaitlistEntity> findByEventIdOrderByPriority(UUID eventId);

    // Get user's waitlist entries
    List<WaitlistEntity> findByUserIdOrderByCreatedAt(UUID userId);

    // Find next person in line (lowest priority)
    @Query("SELECT w FROM WaitlistEntity w WHERE w.eventId = :eventId AND w.notifiedAt IS NULL ORDER BY w.priority ASC")
    Optional<WaitlistEntity> findNextInLine(@Param("eventId") UUID eventId);

    // Find expired notifications that need to be processed
    @Query("SELECT w FROM WaitlistEntity w WHERE w.notificationExpiresAt IS NOT NULL AND w.notificationExpiresAt < :now")
    List<WaitlistEntity> findExpiredNotifications(@Param("now") Instant now);

    // Count people ahead of user in waitlist
    @Query("SELECT COUNT(w) FROM WaitlistEntity w WHERE w.eventId = :eventId AND w.priority < :priority")
    long countPeopleAhead(@Param("eventId") UUID eventId, @Param("priority") Integer priority);

    // Get maximum priority for event (for adding new entries)
    @Query("SELECT COALESCE(MAX(w.priority), 0) FROM WaitlistEntity w WHERE w.eventId = :eventId")
    Integer getMaxPriorityForEvent(@Param("eventId") UUID eventId);

    // Update priorities after someone leaves (compact the queue)
    @Modifying
    @Query("UPDATE WaitlistEntity w SET w.priority = w.priority - 1 WHERE w.eventId = :eventId AND w.priority > :removedPriority")
    int decrementPrioritiesAfter(@Param("eventId") UUID eventId, @Param("removedPriority") Integer removedPriority);

    // Check if user is already in waitlist for event
    boolean existsByEventIdAndUserId(UUID eventId, UUID userId);

    // Count total people in waitlist for event
    long countByEventId(UUID eventId);

    // Find people with active notification windows
    @Query("SELECT w FROM WaitlistEntity w WHERE w.eventId = :eventId AND w.notifiedAt IS NOT NULL AND w.notificationExpiresAt > :now")
    List<WaitlistEntity> findActiveNotifications(@Param("eventId") UUID eventId, @Param("now") Instant now);
}