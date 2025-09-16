package org.aquastream.event.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.aquastream.common.domain.BookingStatus;
import org.aquastream.common.domain.PaymentStatus;
import org.aquastream.event.db.entity.BookingEntity;
import org.aquastream.event.db.entity.EventEntity;
import org.aquastream.event.db.entity.OrganizerEntity;
import org.aquastream.event.db.repository.BookingLogRepository;
import org.aquastream.event.db.repository.BookingRepository;
import org.aquastream.event.db.repository.EventRepository;
import org.aquastream.event.dto.BookingDto;
import org.aquastream.event.dto.CreateBookingRequest;
import org.aquastream.event.exception.BookingConflictException;
import org.aquastream.event.exception.EventNotFoundException;
import org.aquastream.event.mapper.BookingMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit tests for BookingService.
 */
@ExtendWith(MockitoExtension.class)
class BookingServiceTest {
    
    @Mock
    private BookingRepository bookingRepository;
    
    @Mock
    private BookingLogRepository bookingLogRepository;
    
    @Mock
    private EventRepository eventRepository;
    
    @Mock
    private BookingMapper bookingMapper;
    
    @Mock
    private ObjectMapper objectMapper;
    
    @InjectMocks
    private BookingService bookingService;
    
    private UUID userId;
    private UUID eventId;
    private EventEntity event;
    private CreateBookingRequest request;
    
    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        eventId = UUID.randomUUID();
        
        // Create test event
        OrganizerEntity organizer = new OrganizerEntity();
        organizer.setId(UUID.randomUUID());
        organizer.setSlug("test-organizer");
        organizer.setName("Test Organizer");
        
        event = new EventEntity();
        event.setId(eventId);
        event.setOrganizer(organizer);
        event.setTitle("Test Event");
        event.setType("RAFTING");
        event.setStatus("PUBLISHED");
        event.setCapacity(10);
        event.setPrice(BigDecimal.valueOf(100.00));
        event.setDateStart(Instant.now().plusSeconds(86400)); // Tomorrow
        event.setDateEnd(Instant.now().plusSeconds(172800)); // Day after tomorrow
        
        request = new CreateBookingRequest();
        request.setEventId(eventId);
    }
    
    @Test
    void createBooking_Success_PaidEvent() {
        // Given
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(bookingRepository.existsByUserIdAndEventIdAndStatusIn(eq(userId), eq(eventId), any()))
                .thenReturn(false);
        when(bookingRepository.countActiveBookingsByEventId(eventId)).thenReturn(5L);
        
        BookingEntity savedBooking = new BookingEntity();
        savedBooking.setId(UUID.randomUUID());
        savedBooking.setEvent(event);
        savedBooking.setUserId(userId);
        savedBooking.setStatus(BookingStatus.PENDING);
        savedBooking.setAmount(event.getPrice());
        savedBooking.setPaymentStatus(PaymentStatus.PENDING);
        
        when(bookingRepository.save(any(BookingEntity.class))).thenReturn(savedBooking);
        
        BookingDto expectedDto = new BookingDto();
        expectedDto.setId(savedBooking.getId());
        expectedDto.setStatus(BookingStatus.PENDING);
        expectedDto.setAmount(event.getPrice());
        expectedDto.setPaymentStatus(PaymentStatus.PENDING);
        
        when(bookingMapper.toBookingDto(savedBooking)).thenReturn(expectedDto);
        
        // When
        BookingDto result = bookingService.createBooking(userId, request);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(savedBooking.getId());
        assertThat(result.getStatus()).isEqualTo(BookingStatus.PENDING);
        assertThat(result.getAmount()).isEqualTo(event.getPrice());
        assertThat(result.getPaymentStatus()).isEqualTo(PaymentStatus.PENDING);
        
        verify(bookingRepository).save(any(BookingEntity.class));
        verify(bookingLogRepository).save(any());
    }
    
    @Test
    void createBooking_Success_FreeEvent() {
        // Given
        event.setPrice(null); // Free event
        
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(bookingRepository.existsByUserIdAndEventIdAndStatusIn(eq(userId), eq(eventId), any()))
                .thenReturn(false);
        when(bookingRepository.countActiveBookingsByEventId(eventId)).thenReturn(5L);
        
        BookingEntity savedBooking = new BookingEntity();
        savedBooking.setId(UUID.randomUUID());
        savedBooking.setEvent(event);
        savedBooking.setUserId(userId);
        savedBooking.setStatus(BookingStatus.PENDING);
        savedBooking.setAmount(null);
        savedBooking.setPaymentStatus(PaymentStatus.NOT_REQUIRED);
        
        when(bookingRepository.save(any(BookingEntity.class))).thenReturn(savedBooking);
        
        BookingDto expectedDto = new BookingDto();
        expectedDto.setId(savedBooking.getId());
        expectedDto.setStatus(BookingStatus.PENDING);
        expectedDto.setAmount(null);
        expectedDto.setPaymentStatus(PaymentStatus.NOT_REQUIRED);
        
        when(bookingMapper.toBookingDto(savedBooking)).thenReturn(expectedDto);
        
        // When
        BookingDto result = bookingService.createBooking(userId, request);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getPaymentStatus()).isEqualTo(PaymentStatus.NOT_REQUIRED);
        assertThat(result.getAmount()).isNull();
    }
    
    @Test
    void createBooking_EventNotFound() {
        // Given
        when(eventRepository.findById(eventId)).thenReturn(Optional.empty());
        
        // When & Then
        assertThatThrownBy(() -> bookingService.createBooking(userId, request))
                .isInstanceOf(EventNotFoundException.class)
                .hasMessageContaining("Event not found: " + eventId);
    }
    
    @Test
    void createBooking_EventNotPublished() {
        // Given
        event.setStatus("DRAFT");
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        
        // When & Then
        assertThatThrownBy(() -> bookingService.createBooking(userId, request))
                .isInstanceOf(BookingConflictException.class)
                .hasMessageContaining("Event is not available for booking");
    }
    
    @Test
    void createBooking_UserAlreadyHasActiveBooking() {
        // Given
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(bookingRepository.existsByUserIdAndEventIdAndStatusIn(eq(userId), eq(eventId), any()))
                .thenReturn(true);
        
        // When & Then
        assertThatThrownBy(() -> bookingService.createBooking(userId, request))
                .isInstanceOf(BookingConflictException.class)
                .hasMessageContaining("User already has an active booking for this event");
    }
    
    @Test
    void createBooking_EventAtCapacity() {
        // Given
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(bookingRepository.existsByUserIdAndEventIdAndStatusIn(eq(userId), eq(eventId), any()))
                .thenReturn(false);
        when(bookingRepository.countActiveBookingsByEventId(eventId)).thenReturn(10L); // At capacity
        
        // When & Then
        assertThatThrownBy(() -> bookingService.createBooking(userId, request))
                .isInstanceOf(BookingConflictException.class)
                .hasMessageContaining("Event is at full capacity");
    }
    
    @Test
    void updateBookingPaymentStatus_Success() {
        // Given
        UUID paymentId = UUID.randomUUID();
        
        BookingEntity booking = new BookingEntity();
        booking.setId(UUID.randomUUID());
        booking.setEvent(event);
        booking.setUserId(userId);
        booking.setStatus(BookingStatus.PENDING);
        booking.setPaymentStatus(PaymentStatus.PENDING);
        booking.setPaymentId(paymentId);
        
        when(bookingRepository.findByPaymentId(paymentId)).thenReturn(Optional.of(booking));
        
        booking.setPaymentStatus(PaymentStatus.SUCCEEDED);
        booking.setStatus(BookingStatus.CONFIRMED); // Auto-confirm on successful payment
        when(bookingRepository.save(booking)).thenReturn(booking);
        
        BookingDto expectedDto = new BookingDto();
        expectedDto.setId(booking.getId());
        expectedDto.setStatus(BookingStatus.CONFIRMED);
        expectedDto.setPaymentStatus(PaymentStatus.SUCCEEDED);
        
        when(bookingMapper.toBookingDto(booking)).thenReturn(expectedDto);
        
        // When
        BookingDto result = bookingService.updateBookingPaymentStatus(paymentId, PaymentStatus.SUCCEEDED);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(result.getPaymentStatus()).isEqualTo(PaymentStatus.SUCCEEDED);
        
        verify(bookingRepository).save(booking);
        verify(bookingLogRepository).save(any());
    }
}