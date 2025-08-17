package org.aquastream.event.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.event.db.entity.WaitlistAuditEntity;
import org.aquastream.event.db.repository.WaitlistAuditRepository;
import org.aquastream.event.db.repository.WaitlistRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class WaitlistAuditService {

    private final WaitlistAuditRepository auditRepository;
    private final WaitlistRepository waitlistRepository;

    @Async
    @Transactional
    public void logJoined(UUID eventId, UUID userId, Integer priority) {
        long totalInQueue = waitlistRepository.countByEventId(eventId);
        
        WaitlistAuditEntity audit = WaitlistAuditEntity.builder()
                .eventId(eventId)
                .userId(userId)
                .action("JOINED")
                .priorityAfter(priority)
                .totalInQueue(totalInQueue)
                .metadata(String.format("{\"position\": %d}", priority))
                .createdAt(Instant.now())
                .build();

        auditRepository.save(audit);
        log.debug("Audit: User {} joined waitlist for event {} at position {}", userId, eventId, priority);
    }

    @Async
    @Transactional
    public void logLeft(UUID eventId, UUID userId, Integer priorityBefore) {
        long totalInQueue = waitlistRepository.countByEventId(eventId);
        
        WaitlistAuditEntity audit = WaitlistAuditEntity.builder()
                .eventId(eventId)
                .userId(userId)
                .action("LEFT")
                .priorityBefore(priorityBefore)
                .totalInQueue(totalInQueue)
                .metadata(String.format("{\"position_was\": %d}", priorityBefore))
                .createdAt(Instant.now())
                .build();

        auditRepository.save(audit);
        log.debug("Audit: User {} left waitlist for event {} from position {}", userId, eventId, priorityBefore);
    }

    @Async
    @Transactional
    public void logNotified(UUID eventId, UUID userId, Integer priority, Instant expiresAt) {
        WaitlistAuditEntity audit = WaitlistAuditEntity.builder()
                .eventId(eventId)
                .userId(userId)
                .action("NOTIFIED")
                .priorityBefore(priority)
                .notificationExpiresAt(expiresAt)
                .metadata(String.format("{\"notification_window_minutes\": %d}", 
                         java.time.Duration.between(Instant.now(), expiresAt).toMinutes()))
                .createdAt(Instant.now())
                .build();

        auditRepository.save(audit);
        log.debug("Audit: User {} notified for event {}, expires at {}", userId, eventId, expiresAt);
    }

    @Async
    @Transactional
    public void logConfirmed(UUID eventId, UUID userId, Integer priorityBefore) {
        WaitlistAuditEntity audit = WaitlistAuditEntity.builder()
                .eventId(eventId)
                .userId(userId)
                .action("CONFIRMED")
                .priorityBefore(priorityBefore)
                .metadata(String.format("{\"confirmed_from_position\": %d}", priorityBefore))
                .createdAt(Instant.now())
                .build();

        auditRepository.save(audit);
        log.debug("Audit: User {} confirmed spot for event {} from position {}", userId, eventId, priorityBefore);
    }

    @Async
    @Transactional
    public void logExpired(UUID eventId, UUID userId, Integer priority, Instant wasNotifiedAt) {
        WaitlistAuditEntity audit = WaitlistAuditEntity.builder()
                .eventId(eventId)
                .userId(userId)
                .action("EXPIRED")
                .priorityBefore(priority)
                .metadata(String.format("{\"notification_duration_minutes\": %d}", 
                         java.time.Duration.between(wasNotifiedAt, Instant.now()).toMinutes()))
                .createdAt(Instant.now())
                .build();

        auditRepository.save(audit);
        log.debug("Audit: User {} notification expired for event {}", userId, eventId);
    }

    @Async
    @Transactional
    public void logPositionChanged(UUID eventId, UUID userId, Integer oldPosition, Integer newPosition) {
        WaitlistAuditEntity audit = WaitlistAuditEntity.builder()
                .eventId(eventId)
                .userId(userId)
                .action("POSITION_CHANGED")
                .priorityBefore(oldPosition)
                .priorityAfter(newPosition)
                .metadata(String.format("{\"moved_from\": %d, \"moved_to\": %d}", oldPosition, newPosition))
                .createdAt(Instant.now())
                .build();

        auditRepository.save(audit);
        log.debug("Audit: User {} position changed for event {} from {} to {}", userId, eventId, oldPosition, newPosition);
    }
}