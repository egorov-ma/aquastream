package org.aquastream.event.service;

import org.aquastream.event.db.entity.EventEntity;
import org.aquastream.event.db.entity.WaitlistEntity;
import org.aquastream.event.db.repository.EventRepository;
import org.aquastream.event.db.repository.WaitlistRepository;
import org.aquastream.event.dto.WaitlistStatusDto;
import org.aquastream.event.exception.WaitlistException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WaitlistServiceTest {

    @Mock
    private WaitlistRepository waitlistRepository;
    
    @Mock
    private EventRepository eventRepository;
    
    @Mock
    private NotificationService notificationService;
    
    @Mock
    private WaitlistAuditService auditService;

    @InjectMocks
    private WaitlistService waitlistService;

    private UUID eventId;
    private UUID userId1;
    private UUID userId2;
    private EventEntity testEvent;

    @BeforeEach
    void setUp() {
        eventId = UUID.randomUUID();
        userId1 = UUID.randomUUID();
        userId2 = UUID.randomUUID();
        
        testEvent = EventEntity.builder()
                .id(eventId)
                .organizerSlug("test-organizer")
                .status("PUBLISHED")
                .available(0) // No spots available
                .capacity(10)
                .build();

        // Set notification window to 30 minutes
        ReflectionTestUtils.setField(waitlistService, "notificationWindowMinutes", 30);
    }

    @Test
    void joinWaitlist_Success() {
        // Given
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(testEvent));
        when(waitlistRepository.existsByEventIdAndUserId(eventId, userId1)).thenReturn(false);
        when(waitlistRepository.getMaxPriorityForEvent(eventId)).thenReturn(0);
        when(waitlistRepository.countPeopleAhead(eventId, 1)).thenReturn(0L);
        when(waitlistRepository.countByEventId(eventId)).thenReturn(1L);
        
        WaitlistEntity savedEntity = WaitlistEntity.builder()
                .id(UUID.randomUUID())
                .eventId(eventId)
                .userId(userId1)
                .priority(1)
                .createdAt(Instant.now())
                .build();
        
        when(waitlistRepository.save(any(WaitlistEntity.class))).thenReturn(savedEntity);

        // When
        WaitlistStatusDto result = waitlistService.joinWaitlist(eventId, userId1);

        // Then
        assertNotNull(result);
        assertEquals(eventId, result.getEventId());
        assertEquals(userId1, result.getUserId());
        assertEquals(1, result.getPosition());
        assertEquals("WAITING", result.getStatus());
        
        verify(auditService).logJoined(eventId, userId1, 1);
        verify(waitlistRepository).save(any(WaitlistEntity.class));
    }

    @Test
    void joinWaitlist_EventHasAvailableSpots_ThrowsException() {
        // Given
        testEvent.setAvailable(5); // Has available spots
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(testEvent));

        // When/Then
        WaitlistException exception = assertThrows(WaitlistException.class, 
            () -> waitlistService.joinWaitlist(eventId, userId1));
        
        assertEquals("Event has available spots. Book directly instead of joining waitlist.", 
                    exception.getMessage());
    }

    @Test
    void leaveWaitlist_Success() {
        // Given
        WaitlistEntity waitlistEntry = WaitlistEntity.builder()
                .id(UUID.randomUUID())
                .eventId(eventId)
                .userId(userId1)
                .priority(1)
                .build();
        
        when(waitlistRepository.findByEventIdAndUserId(eventId, userId1))
                .thenReturn(Optional.of(waitlistEntry));

        // When
        waitlistService.leaveWaitlist(eventId, userId1);

        // Then
        verify(auditService).logLeft(eventId, userId1, 1);
        verify(waitlistRepository).delete(waitlistEntry);
        verify(waitlistRepository).decrementPrioritiesAfter(eventId, 1);
    }

    @Test
    void notifyNextInLine_Success() {
        // Given
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(testEvent));
        
        WaitlistEntity nextInLine = WaitlistEntity.builder()
                .id(UUID.randomUUID())
                .eventId(eventId)
                .userId(userId1)
                .priority(1)
                .build();
        
        when(waitlistRepository.findNextInLine(eventId)).thenReturn(Optional.of(nextInLine));
        when(waitlistRepository.save(any(WaitlistEntity.class))).thenReturn(nextInLine);
        when(waitlistRepository.countPeopleAhead(eventId, 1)).thenReturn(0L);
        when(waitlistRepository.countByEventId(eventId)).thenReturn(1L);

        // When
        WaitlistStatusDto result = waitlistService.notifyNextInLine(eventId, "test-organizer");

        // Then
        assertNotNull(result);
        assertEquals("NOTIFIED", result.getStatus());
        assertTrue(result.isNotified());
        assertNotNull(result.getNotificationExpiresAt());
        
        verify(auditService).logNotified(eq(eventId), eq(userId1), eq(1), any(Instant.class));
        verify(notificationService).sendWaitlistNotification(eq(userId1), eq(eventId), any(Instant.class));
    }

    @Test
    void processExpiredNotifications_SimulateTimeout() {
        // Given - Create expired notification
        Instant expiredTime = Instant.now().minus(1, ChronoUnit.HOURS);
        
        WaitlistEntity expiredEntry = WaitlistEntity.builder()
                .id(UUID.randomUUID())
                .eventId(eventId)
                .userId(userId1)
                .priority(1)
                .notifiedAt(Instant.now().minus(2, ChronoUnit.HOURS))
                .notificationExpiresAt(expiredTime)
                .build();

        WaitlistEntity nextInLine = WaitlistEntity.builder()
                .id(UUID.randomUUID())
                .eventId(eventId)
                .userId(userId2)
                .priority(2)
                .build();

        when(waitlistRepository.findExpiredNotifications(any(Instant.class)))
                .thenReturn(List.of(expiredEntry));
        when(waitlistRepository.save(any(WaitlistEntity.class))).thenReturn(expiredEntry);

        // When
        waitlistService.processExpiredNotifications();

        // Then
        verify(auditService).logExpired(eq(eventId), eq(userId1), eq(1), any(Instant.class));
        verify(waitlistRepository).save(argThat(entity -> 
            entity.getNotifiedAt() == null && entity.getNotificationExpiresAt() == null));
    }

    @Test
    void confirmSpot_Success() {
        // Given
        Instant notificationTime = Instant.now().minus(10, ChronoUnit.MINUTES);
        Instant expirationTime = Instant.now().plus(20, ChronoUnit.MINUTES);
        
        WaitlistEntity waitlistEntry = WaitlistEntity.builder()
                .id(UUID.randomUUID())
                .eventId(eventId)
                .userId(userId1)
                .priority(1)
                .notifiedAt(notificationTime)
                .notificationExpiresAt(expirationTime)
                .build();
        
        when(waitlistRepository.findByEventIdAndUserId(eventId, userId1))
                .thenReturn(Optional.of(waitlistEntry));

        // When
        waitlistService.confirmSpot(eventId, userId1);

        // Then
        verify(auditService).logConfirmed(eventId, userId1, 1);
        verify(waitlistRepository).delete(waitlistEntry);
        verify(waitlistRepository).decrementPrioritiesAfter(eventId, 1);
    }

    @Test
    void confirmSpot_NotificationExpired_ThrowsException() {
        // Given
        Instant expiredTime = Instant.now().minus(1, ChronoUnit.HOURS);
        
        WaitlistEntity waitlistEntry = WaitlistEntity.builder()
                .id(UUID.randomUUID())
                .eventId(eventId)
                .userId(userId1)
                .priority(1)
                .notifiedAt(Instant.now().minus(2, ChronoUnit.HOURS))
                .notificationExpiresAt(expiredTime)
                .build();
        
        when(waitlistRepository.findByEventIdAndUserId(eventId, userId1))
                .thenReturn(Optional.of(waitlistEntry));

        // When/Then
        WaitlistException exception = assertThrows(WaitlistException.class, 
            () -> waitlistService.confirmSpot(eventId, userId1));
        
        assertEquals("Notification window has expired", exception.getMessage());
    }

    @Test
    void fifoOrderTest_MultipleUsers() {
        // Test FIFO ordering with multiple users joining
        
        // User 1 joins first
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(testEvent));
        when(waitlistRepository.existsByEventIdAndUserId(eventId, userId1)).thenReturn(false);
        when(waitlistRepository.getMaxPriorityForEvent(eventId)).thenReturn(0);
        
        WaitlistEntity user1Entry = WaitlistEntity.builder()
                .id(UUID.randomUUID())
                .eventId(eventId)
                .userId(userId1)
                .priority(1)
                .createdAt(Instant.now())
                .build();
        
        when(waitlistRepository.save(any(WaitlistEntity.class))).thenReturn(user1Entry);
        when(waitlistRepository.countPeopleAhead(eventId, 1)).thenReturn(0L);
        when(waitlistRepository.countByEventId(eventId)).thenReturn(1L);
        
        WaitlistStatusDto user1Status = waitlistService.joinWaitlist(eventId, userId1);
        assertEquals(1, user1Status.getPosition());

        // User 2 joins second
        when(waitlistRepository.existsByEventIdAndUserId(eventId, userId2)).thenReturn(false);
        when(waitlistRepository.getMaxPriorityForEvent(eventId)).thenReturn(1);
        
        WaitlistEntity user2Entry = WaitlistEntity.builder()
                .id(UUID.randomUUID())
                .eventId(eventId)
                .userId(userId2)
                .priority(2)
                .createdAt(Instant.now())
                .build();
        
        when(waitlistRepository.save(any(WaitlistEntity.class))).thenReturn(user2Entry);
        when(waitlistRepository.countPeopleAhead(eventId, 2)).thenReturn(1L);
        when(waitlistRepository.countByEventId(eventId)).thenReturn(2L);
        
        WaitlistStatusDto user2Status = waitlistService.joinWaitlist(eventId, userId2);
        assertEquals(2, user2Status.getPosition());

        // Verify FIFO order: user1 should be notified first
        when(waitlistRepository.findNextInLine(eventId)).thenReturn(Optional.of(user1Entry));
        when(waitlistRepository.save(any(WaitlistEntity.class))).thenReturn(user1Entry);
        when(waitlistRepository.countPeopleAhead(eventId, 1)).thenReturn(0L);
        when(waitlistRepository.countByEventId(eventId)).thenReturn(2L);
        
        WaitlistStatusDto notified = waitlistService.notifyNextInLine(eventId, "test-organizer");
        assertEquals(userId1, notified.getUserId());
    }
}