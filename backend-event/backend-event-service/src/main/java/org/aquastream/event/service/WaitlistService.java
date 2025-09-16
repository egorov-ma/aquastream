package org.aquastream.event.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.event.db.entity.EventEntity;
import org.aquastream.event.db.entity.WaitlistEntity;
import org.aquastream.event.db.repository.EventRepository;
import org.aquastream.event.db.repository.WaitlistRepository;
import org.aquastream.event.dto.WaitlistStatusDto;
import org.aquastream.event.exception.EventNotFoundException;
import org.aquastream.event.exception.WaitlistException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class WaitlistService {

    private final WaitlistRepository waitlistRepository;
    private final EventRepository eventRepository;
    private final NotificationService notificationService;
    private final WaitlistAuditService auditService;

    @Value("${app.waitlist.notification-window-minutes:30}")
    private int notificationWindowMinutes;

    public WaitlistStatusDto joinWaitlist(UUID eventId, UUID userId) {
        // Check if event exists and is published
        EventEntity event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found: " + eventId));

        if (!"PUBLISHED".equals(event.getStatus())) {
            throw new WaitlistException("Can only join waitlist for published events");
        }

        // Check if event has available spots
        if (event.getAvailable() > 0) {
            throw new WaitlistException("Event has available spots. Book directly instead of joining waitlist.");
        }

        // Check if user is already in waitlist
        if (waitlistRepository.existsByEventIdAndUserId(eventId, userId)) {
            throw new WaitlistException("User is already in waitlist for this event");
        }

        // Get next priority (FIFO)
        Integer maxPriority = waitlistRepository.getMaxPriorityForEvent(eventId);
        Integer newPriority = maxPriority + 1;

        // Create waitlist entry
        WaitlistEntity waitlistEntry = WaitlistEntity.builder()
                .eventId(eventId)
                .userId(userId)
                .priority(newPriority)
                .createdAt(Instant.now())
                .build();

        WaitlistEntity saved = waitlistRepository.save(waitlistEntry);

        // Audit log
        auditService.logJoined(eventId, userId, newPriority);

        log.info("User {} joined waitlist for event {} at position {}", userId, eventId, newPriority);

        return mapToStatusDto(saved);
    }

    public void leaveWaitlist(UUID eventId, UUID userId) {
        WaitlistEntity waitlistEntry = waitlistRepository.findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new WaitlistException("User is not in waitlist for this event"));

        Integer removedPriority = waitlistEntry.getPriority();
        waitlistRepository.delete(waitlistEntry);

        // Audit log
        auditService.logLeft(eventId, userId, removedPriority);

        // Compact the queue - move everyone up
        waitlistRepository.decrementPrioritiesAfter(eventId, removedPriority);

        log.info("User {} left waitlist for event {} from position {}", userId, eventId, removedPriority);
    }

    @Transactional(readOnly = true)
    public Optional<WaitlistStatusDto> getWaitlistStatus(UUID eventId, UUID userId) {
        return waitlistRepository.findByEventIdAndUserId(eventId, userId)
                .map(this::mapToStatusDto);
    }

    @Transactional(readOnly = true)
    public List<WaitlistStatusDto> getUserWaitlists(UUID userId) {
        return waitlistRepository.findByUserIdOrderByCreatedAt(userId).stream()
                .map(this::mapToStatusDto)
                .collect(Collectors.toList());
    }

    public WaitlistStatusDto notifyNextInLine(UUID eventId, String organizerSlug) {
        // Verify organizer owns this event
        EventEntity event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found: " + eventId));

        if (!organizerSlug.equals(event.getOrganizerSlug())) {
            throw new WaitlistException("Only event organizer can notify waitlist members");
        }

        // Find next person in line
        Optional<WaitlistEntity> nextInLine = waitlistRepository.findNextInLine(eventId);
        if (nextInLine.isEmpty()) {
            throw new WaitlistException("No one is waiting for this event");
        }

        WaitlistEntity waitlistEntry = nextInLine.get();
        
        // Set notification times
        Instant now = Instant.now();
        Instant expiresAt = now.plus(notificationWindowMinutes, ChronoUnit.MINUTES);
        
        waitlistEntry.setNotifiedAt(now);
        waitlistEntry.setNotificationExpiresAt(expiresAt);
        
        WaitlistEntity saved = waitlistRepository.save(waitlistEntry);

        // Audit log
        auditService.logNotified(eventId, saved.getUserId(), saved.getPriority(), expiresAt);

        // Send notification asynchronously
        notificationService.sendWaitlistNotification(saved.getUserId(), eventId, expiresAt);

        log.info("Notified user {} about available spot for event {}. Expires at {}", 
                 saved.getUserId(), eventId, expiresAt);

        return mapToStatusDto(saved);
    }

    public void confirmSpot(UUID eventId, UUID userId) {
        WaitlistEntity waitlistEntry = waitlistRepository.findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new WaitlistException("User is not in waitlist for this event"));

        if (waitlistEntry.getNotifiedAt() == null) {
            throw new WaitlistException("User has not been notified about available spot");
        }

        if (waitlistEntry.getNotificationExpiresAt() != null && 
            waitlistEntry.getNotificationExpiresAt().isBefore(Instant.now())) {
            throw new WaitlistException("Notification window has expired");
        }

        // Audit log
        auditService.logConfirmed(eventId, userId, waitlistEntry.getPriority());

        // Remove from waitlist (they got the spot)
        waitlistRepository.delete(waitlistEntry);

        // Compact the queue
        waitlistRepository.decrementPrioritiesAfter(eventId, waitlistEntry.getPriority());

        log.info("User {} confirmed spot for event {} and was removed from waitlist", userId, eventId);
    }

    @Scheduled(fixedDelayString = "${app.waitlist.cleanup-interval-minutes:5}000", initialDelay = 60000)
    public void processExpiredNotifications() {
        List<WaitlistEntity> expiredNotifications = waitlistRepository.findExpiredNotifications(Instant.now());
        
        for (WaitlistEntity expired : expiredNotifications) {
            try {
                handleExpiredNotification(expired);
            } catch (Exception e) {
                log.error("Error processing expired notification for user {} event {}: {}", 
                         expired.getUserId(), expired.getEventId(), e.getMessage());
            }
        }
        
        if (!expiredNotifications.isEmpty()) {
            log.info("Processed {} expired waitlist notifications", expiredNotifications.size());
        }
    }

    private void handleExpiredNotification(WaitlistEntity expired) {
        // Audit log
        auditService.logExpired(expired.getEventId(), expired.getUserId(), 
                               expired.getPriority(), expired.getNotifiedAt());

        // Reset notification fields
        expired.setNotifiedAt(null);
        expired.setNotificationExpiresAt(null);
        waitlistRepository.save(expired);

        // Try to notify next person in line
        try {
            EventEntity event = eventRepository.findById(expired.getEventId()).orElse(null);
            if (event != null && event.getAvailable() > 0) {
                Optional<WaitlistEntity> nextInLine = waitlistRepository.findNextInLine(expired.getEventId());
                if (nextInLine.isPresent() && !nextInLine.get().getId().equals(expired.getId())) {
                    notifyNextInLine(expired.getEventId(), event.getOrganizerSlug());
                }
            }
        } catch (Exception e) {
            log.error("Error notifying next person after expiration: {}", e.getMessage());
        }

        log.info("Expired notification for user {} event {} - spot passed to next in line", 
                 expired.getUserId(), expired.getEventId());
    }

    private WaitlistStatusDto mapToStatusDto(WaitlistEntity entity) {
        long peopleAhead = waitlistRepository.countPeopleAhead(entity.getEventId(), entity.getPriority());
        long totalInQueue = waitlistRepository.countByEventId(entity.getEventId());
        
        String status = "WAITING";
        if (entity.getNotifiedAt() != null) {
            if (entity.getNotificationExpiresAt() != null && 
                entity.getNotificationExpiresAt().isBefore(Instant.now())) {
                status = "EXPIRED";
            } else {
                status = "NOTIFIED";
            }
        }

        return WaitlistStatusDto.builder()
                .id(entity.getId())
                .eventId(entity.getEventId())
                .userId(entity.getUserId())
                .position((int) peopleAhead + 1) // 1-based position
                .totalInQueue(totalInQueue)
                .joinedAt(entity.getCreatedAt())
                .notified(entity.getNotifiedAt() != null)
                .notifiedAt(entity.getNotifiedAt())
                .notificationExpiresAt(entity.getNotificationExpiresAt())
                .status(status)
                .build();
    }
    
    /**
     * Process waitlist when event capacity is freed up (e.g., booking cancellation/expiration).
     * This method is called when spots become available to notify the next person in line.
     */
    @Async
    public void processWaitlistForEvent(UUID eventId) {
        try {
            log.info("Processing waitlist for event {}", eventId);
            
            EventEntity event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new EventNotFoundException("Event not found: " + eventId));
            
            // Only process if there are available spots
            if (event.getAvailable() <= 0) {
                log.debug("No available spots for event {}, skipping waitlist processing", eventId);
                return;
            }
            
            // Find the next person in line who hasn't been notified
            Optional<WaitlistEntity> nextInLine = waitlistRepository.findNextInLine(eventId);
            
            if (nextInLine.isEmpty()) {
                log.debug("No one in waitlist for event {}", eventId);
                return;
            }
            
            WaitlistEntity waitlistEntry = nextInLine.get();
            
            // Skip if already notified and notification hasn't expired
            if (waitlistEntry.getNotifiedAt() != null && 
                waitlistEntry.getNotificationExpiresAt() != null &&
                waitlistEntry.getNotificationExpiresAt().isAfter(Instant.now())) {
                log.debug("Next person in line for event {} is already notified and notification hasn't expired", eventId);
                return;
            }
            
            // Notify the next person
            notifyWaitlistUser(waitlistEntry, event.getOrganizerSlug());
            
            log.info("Successfully processed waitlist for event {} - notified user {}", 
                    eventId, waitlistEntry.getUserId());
            
        } catch (Exception e) {
            log.error("Error processing waitlist for event {}: {}", eventId, e.getMessage(), e);
        }
    }
    
    /**
     * Notify a specific waitlist user about available spot
     */
    private void notifyWaitlistUser(WaitlistEntity waitlistEntry, String organizerSlug) {
        Instant notificationTime = Instant.now();
        Instant expirationTime = notificationTime.plus(notificationWindowMinutes, ChronoUnit.MINUTES);
        
        // Update notification fields
        waitlistEntry.setNotifiedAt(notificationTime);
        waitlistEntry.setNotificationExpiresAt(expirationTime);
        waitlistRepository.save(waitlistEntry);
        
        // Send notification
        notificationService.sendWaitlistSpotAvailable(
                waitlistEntry.getUserId(), 
                waitlistEntry.getEventId(),
                organizerSlug,
                notificationWindowMinutes
        );
        
        // Audit log
        auditService.logNotified(waitlistEntry.getEventId(), waitlistEntry.getUserId(), 
                                waitlistEntry.getPriority(), expirationTime);
        
        log.info("Notified user {} about available spot for event {} (expires at {})", 
                waitlistEntry.getUserId(), waitlistEntry.getEventId(), expirationTime);
    }
}