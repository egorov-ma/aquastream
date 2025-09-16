package org.aquastream.event.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.common.domain.BookingStatus;
import org.aquastream.common.domain.PaymentStatus;
import org.aquastream.event.db.entity.BookingEntity;
import org.aquastream.event.db.entity.BookingLogEntity;
import org.aquastream.event.db.entity.EventEntity;
import org.aquastream.event.db.repository.BookingLogRepository;
import org.aquastream.event.db.repository.BookingRepository;
import org.aquastream.event.db.repository.EventRepository;
import org.aquastream.event.dto.BookingDto;
import org.aquastream.event.dto.CreateBookingRequest;
import org.aquastream.event.dto.PagedResponse;
import org.aquastream.event.exception.BookingConflictException;
import org.aquastream.event.exception.BookingNotFoundException;
import org.aquastream.event.exception.EventNotFoundException;
import org.aquastream.event.exception.UnauthorizedBookingAccessException;
import org.aquastream.event.mapper.BookingMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Service for managing bookings with business logic validation.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BookingService {
    
    private final BookingRepository bookingRepository;
    private final BookingLogRepository bookingLogRepository;
    private final EventRepository eventRepository;
    private final BookingMapper bookingMapper;
    private final ObjectMapper objectMapper;
    private final WaitlistService waitlistService;
    private final PaymentClient paymentClient;
    
    // TODO: Inject after implementing user-service integration
    // private final UserProfileService userProfileService;
    
    /**
     * Create a new booking for a user
     */
    public BookingDto createBooking(UUID userId, CreateBookingRequest request) {
        log.info("Creating booking for user {} and event {}", userId, request.getEventId());
        
        // 1. Validate event exists and is published
        EventEntity event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new EventNotFoundException("Event not found: " + request.getEventId()));
        
        if (!"PUBLISHED".equals(event.getStatus())) {
            throw new BookingConflictException("Event is not available for booking");
        }
        
        // 2. Check if user already has an active booking for this event
        List<BookingStatus> activeStatuses = Arrays.asList(
            BookingStatus.PENDING, BookingStatus.CONFIRMED
        );
        
        if (bookingRepository.existsByUserIdAndEventIdAndStatusIn(userId, request.getEventId(), activeStatuses)) {
            throw new BookingConflictException("User already has an active booking for this event");
        }
        
        // 3. Check event capacity
        long activeBookings = bookingRepository.countActiveBookingsByEventId(request.getEventId());
        if (activeBookings >= event.getCapacity()) {
            log.warn("Event {} is at capacity ({} bookings, {} capacity)", 
                    request.getEventId(), activeBookings, event.getCapacity());
            
            // TODO: Add to waitlist
            throw new BookingConflictException("Event is at full capacity. Please join the waitlist.");
        }
        
        // 4. TODO: Check user profile completeness (phone/telegram required)
        // validateUserProfile(userId);
        
        // 5. Create booking
        BookingEntity booking = new BookingEntity();
        booking.setEvent(event);
        booking.setUserId(userId);
        booking.setStatus(BookingStatus.PENDING);
        booking.setAmount(event.getPrice()); // Lock price at booking time
        
        // Set payment status based on event price
        if (event.getPrice() != null && event.getPrice().compareTo(BigDecimal.ZERO) > 0) {
            booking.setPaymentStatus(PaymentStatus.PENDING);
        } else {
            booking.setPaymentStatus(PaymentStatus.NOT_REQUIRED);
        }
        
        booking = bookingRepository.save(booking);
        
        // 6. Initialize payment if required
        if (event.getPrice() != null && event.getPrice().compareTo(BigDecimal.ZERO) > 0) {
            try {
                String description = String.format("Payment for event: %s", event.getTitle());
                PaymentClient.PaymentInitResponse paymentResponse = paymentClient.initializePayment(
                        booking.getId(), userId, event.getPrice(), description);
                
                // Update booking with payment ID
                booking.setPaymentId(paymentResponse.getPaymentId());
                booking = bookingRepository.save(booking);
                
                log.info("Payment initialized for booking {} with payment ID {}", 
                        booking.getId(), paymentResponse.getPaymentId());
                
            } catch (Exception e) {
                log.error("Failed to initialize payment for booking {}: {}", booking.getId(), e.getMessage());
                // You might want to cancel the booking or set a specific status
                // For now, we'll let the booking exist without payment ID
            }
        }
        
        // 7. Create audit log
        createBookingLog(booking, BookingLogEntity.BookingLogAction.CREATED, null, userId);
        
        // 8. TODO: Send notification
        // notificationService.sendBookingCreated(booking);
        
        log.info("Created booking {} for user {} and event {}", booking.getId(), userId, request.getEventId());
        
        return bookingMapper.toBookingDto(booking);
    }
    
    /**
     * Confirm a booking (mark as confirmed after payment or for free events)
     */
    public BookingDto confirmBooking(UUID bookingId, UUID userId) {
        log.info("Confirming booking {} for user {}", bookingId, userId);
        
        BookingEntity booking = findBookingByIdAndUserId(bookingId, userId);
        
        if (!booking.canBeConfirmed()) {
            throw new BookingConflictException("Booking cannot be confirmed in current state");
        }
        
        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(BookingStatus.CONFIRMED);
        booking = bookingRepository.save(booking);
        
        // Create audit log
        createBookingLog(booking, BookingLogEntity.BookingLogAction.CONFIRMED, oldStatus, userId);
        
        // TODO: Send confirmation notification
        // notificationService.sendBookingConfirmed(booking);
        
        log.info("Confirmed booking {}", bookingId);
        
        return bookingMapper.toBookingDto(booking);
    }
    
    /**
     * Cancel a booking
     */
    public BookingDto cancelBooking(UUID bookingId, UUID userId, String reason) {
        log.info("Cancelling booking {} for user {} with reason: {}", bookingId, userId, reason);
        
        BookingEntity booking = findBookingByIdAndUserId(bookingId, userId);
        
        if (booking.getStatus() == BookingStatus.COMPLETED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BookingConflictException("Cannot cancel booking in status: " + booking.getStatus());
        }
        
        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(BookingStatus.CANCELLED);
        booking = bookingRepository.save(booking);
        
        // Create audit log with reason
        JsonNode reasonNode = objectMapper.valueToTree(reason);
        createBookingLog(booking, BookingLogEntity.BookingLogAction.CANCELLED, oldStatus, userId, reasonNode);
        
        // Release event capacity and process waitlist
        releaseEventCapacity(booking.getEvent(), 1);
        waitlistService.processWaitlistForEvent(booking.getEvent().getId());
        
        // TODO: Send cancellation notification
        // notificationService.sendBookingCancelled(booking);
        
        log.info("Cancelled booking {}", bookingId);
        
        return bookingMapper.toBookingDto(booking);
    }
    
    /**
     * Get user's bookings with pagination
     */
    @Transactional(readOnly = true)
    public PagedResponse<BookingDto> getUserBookings(UUID userId, BookingStatus status, Pageable pageable) {
        Page<BookingEntity> bookingsPage;
        
        if (status != null) {
            bookingsPage = bookingRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status, pageable);
        } else {
            bookingsPage = bookingRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        }
        
        Page<BookingDto> dtoPage = bookingsPage.map(bookingMapper::toBookingDto);
        return toPagedResponse(dtoPage);
    }
    
    /**
     * Get bookings for an event (organizer view)
     */
    @Transactional(readOnly = true)
    public PagedResponse<BookingDto> getEventBookings(UUID eventId, BookingStatus status, Pageable pageable) {
        Page<BookingEntity> bookingsPage;
        
        if (status != null) {
            bookingsPage = bookingRepository.findByEventIdAndStatusOrderByCreatedAtDesc(eventId, status, pageable);
        } else {
            bookingsPage = bookingRepository.findByEventIdOrderByCreatedAtDesc(eventId, pageable);
        }
        
        Page<BookingDto> dtoPage = bookingsPage.map(bookingMapper::toBookingDto);
        return toPagedResponse(dtoPage);
    }
    
    /**
     * Update booking payment status (called by payment service webhook)
     */
    public BookingDto updateBookingPaymentStatus(UUID paymentId, PaymentStatus paymentStatus) {
        log.info("Updating booking payment status for payment {} to {}", paymentId, paymentStatus);
        
        BookingEntity booking = bookingRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found for payment: " + paymentId));
        
        PaymentStatus oldPaymentStatus = booking.getPaymentStatus();
        booking.setPaymentStatus(paymentStatus);
        
        // Auto-confirm booking if payment succeeded and booking is pending
        if (paymentStatus == PaymentStatus.SUCCEEDED && booking.getStatus() == BookingStatus.PENDING) {
            booking.setStatus(BookingStatus.CONFIRMED);
        }
        
        booking = bookingRepository.save(booking);
        
        // Create audit log
        createBookingLog(booking, BookingLogEntity.BookingLogAction.PAYMENT_UPDATED, oldPaymentStatus, null);
        
        log.info("Updated booking {} payment status from {} to {}", 
                booking.getId(), oldPaymentStatus, paymentStatus);
        
        return bookingMapper.toBookingDto(booking);
    }
    
    /**
     * Confirm booking after successful payment (called by payment service)
     */
    public BookingDto confirmBookingAfterPayment(UUID paymentId) {
        log.info("Confirming booking after successful payment for payment {}", paymentId);
        
        BookingEntity booking = bookingRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found for payment: " + paymentId));
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            log.warn("Booking {} is not in PENDING status, current status: {}", booking.getId(), booking.getStatus());
            return bookingMapper.toBookingDto(booking);
        }
        
        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(BookingStatus.CONFIRMED);
        booking = bookingRepository.save(booking);
        
        // Create audit log
        createBookingLog(booking, BookingLogEntity.BookingLogAction.CONFIRMED, oldStatus, null);
        
        log.info("Successfully confirmed booking {} after payment", booking.getId());
        
        return bookingMapper.toBookingDto(booking);
    }
    
    /**
     * Find expired pending bookings for cleanup job
     */
    @Transactional(readOnly = true)
    public List<BookingEntity> findExpiredPendingBookings() {
        return bookingRepository.findExpiredPendingBookings(Instant.now());
    }
    
    /**
     * Expire bookings (called by scheduled job)
     */
    public void expireBookings(List<BookingEntity> expiredBookings) {
        if (expiredBookings.isEmpty()) {
            return;
        }
        
        log.info("Expiring {} bookings", expiredBookings.size());
        
        List<UUID> bookingIds = expiredBookings.stream()
                .map(BookingEntity::getId)
                .toList();
        
        // Bulk update booking statuses
        Instant now = Instant.now();
        int updated = bookingRepository.updateBookingStatuses(bookingIds, BookingStatus.EXPIRED, now);
        
        // Create audit logs for expired bookings
        for (BookingEntity booking : expiredBookings) {
            createBookingLog(booking, BookingLogEntity.BookingLogAction.EXPIRED, BookingStatus.PENDING, null);
        }
        
        log.info("Expired {} bookings", updated);
        
        // Release capacity and process waitlist for affected events
        var eventCapacityUpdates = new java.util.HashMap<UUID, Integer>();
        for (BookingEntity booking : expiredBookings) {
            UUID eventId = booking.getEvent().getId();
            eventCapacityUpdates.merge(eventId, 1, Integer::sum);
        }
        
        // Update event capacity and process waitlists
        for (var entry : eventCapacityUpdates.entrySet()) {
            UUID eventId = entry.getKey();
            int capacityToRelease = entry.getValue();
            
            EventEntity event = eventRepository.findById(eventId).orElse(null);
            if (event != null) {
                releaseEventCapacity(event, capacityToRelease);
                waitlistService.processWaitlistForEvent(eventId);
            }
        }
    }
    
    /**
     * Helper method to find booking by ID and validate user access
     */
    private BookingEntity findBookingByIdAndUserId(UUID bookingId, UUID userId) {
        BookingEntity booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found: " + bookingId));
        
        if (!booking.getUserId().equals(userId)) {
            throw new UnauthorizedBookingAccessException("User not authorized to access this booking");
        }
        
        return booking;
    }
    
    /**
     * Create a booking audit log entry
     */
    private void createBookingLog(BookingEntity booking, BookingLogEntity.BookingLogAction action, 
                                 Object oldValue, UUID actorUserId) {
        createBookingLog(booking, action, oldValue, actorUserId, null);
    }
    
    /**
     * Create a booking audit log entry with custom new value
     */
    private void createBookingLog(BookingEntity booking, BookingLogEntity.BookingLogAction action, 
                                 Object oldValue, UUID actorUserId, JsonNode newValue) {
        BookingLogEntity log = new BookingLogEntity();
        log.setBooking(booking);
        log.setAction(action);
        log.setActorUserId(actorUserId);
        
        if (oldValue != null) {
            log.setOldValue(objectMapper.valueToTree(oldValue));
        }
        
        if (newValue != null) {
            log.setNewValue(newValue);
        } else {
            log.setNewValue(objectMapper.valueToTree(booking.getStatus()));
        }
        
        bookingLogRepository.save(log);
    }
    
    /**
     * Get bookings for organizer's events with filtering
     */
    @Transactional(readOnly = true)
    public PagedResponse<BookingDto> getBookingsByOrganizer(UUID organizerId, UUID eventId, 
                                                           BookingStatus status, Pageable pageable) {
        log.info("Getting bookings for organizer {} with eventId: {}, status: {}", organizerId, eventId, status);
        
        Page<BookingEntity> bookingsPage;
        
        if (eventId != null && status != null) {
            bookingsPage = bookingRepository.findByOrganizerIdAndEventIdAndStatusOrderByCreatedAtDesc(
                    organizerId, eventId, status, pageable);
        } else if (eventId != null) {
            bookingsPage = bookingRepository.findByOrganizerIdAndEventIdOrderByCreatedAtDesc(
                    organizerId, eventId, pageable);
        } else if (status != null) {
            bookingsPage = bookingRepository.findByOrganizerIdAndStatusOrderByCreatedAtDesc(
                    organizerId, status, pageable);
        } else {
            bookingsPage = bookingRepository.findByOrganizerIdOrderByCreatedAtDesc(organizerId, pageable);
        }
        
        Page<BookingDto> dtoPage = bookingsPage.map(bookingMapper::toBookingDto);
        return toPagedResponse(dtoPage);
    }
    
    /**
     * Update booking status by organizer
     */
    public BookingDto updateBookingStatus(UUID bookingId, BookingStatus newStatus, 
                                         UUID organizerId, String reason) {
        log.info("Organizer {} updating booking {} status to {} with reason: {}", 
                organizerId, bookingId, newStatus, reason);
        
        BookingEntity booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found: " + bookingId));
        
        // Verify organizer owns this event
        if (!booking.getEvent().getOrganizer().getId().equals(organizerId)) {
            throw new UnauthorizedBookingAccessException("Organizer not authorized to modify this booking");
        }
        
        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(newStatus);
        booking = bookingRepository.save(booking);
        
        // Create audit log with reason
        JsonNode reasonNode = reason != null ? objectMapper.valueToTree(reason) : null;
        createBookingLog(booking, BookingLogEntity.BookingLogAction.STATUS_CHANGED, 
                        oldStatus, organizerId, reasonNode);
        
        log.info("Organizer {} updated booking {} status from {} to {}", 
                organizerId, bookingId, oldStatus, newStatus);
        
        return bookingMapper.toBookingDto(booking);
    }
    
    /**
     * Get booking details for organizer (with authorization check)
     */
    @Transactional(readOnly = true)
    public BookingDto getBookingForOrganizer(UUID bookingId, UUID organizerId) {
        BookingEntity booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found: " + bookingId));
        
        // Verify organizer owns this event
        if (!booking.getEvent().getOrganizer().getId().equals(organizerId)) {
            throw new UnauthorizedBookingAccessException("Organizer not authorized to view this booking");
        }
        
        return bookingMapper.toBookingDto(booking);
    }
    
    /**
     * Get booking statistics for organizer's events
     */
    @Transactional(readOnly = true)
    public Object getBookingStatistics(UUID organizerId, UUID eventId) {
        log.info("Getting booking statistics for organizer {} and event {}", organizerId, eventId);
        
        // Get booking counts by status
        List<Object[]> bookingStats;
        if (eventId != null) {
            bookingStats = bookingRepository.getBookingStatisticsByOrganizerAndEvent(organizerId, eventId);
        } else {
            bookingStats = bookingRepository.getBookingStatisticsByOrganizer(organizerId);
        }
        
        // Transform to a more user-friendly format
        var statistics = new java.util.HashMap<String, Object>();
        
        long totalBookings = 0;
        var statusCounts = new java.util.HashMap<String, Long>();
        
        for (Object[] stat : bookingStats) {
            BookingStatus status = (BookingStatus) stat[0];
            Long count = (Long) stat[1];
            statusCounts.put(status.name(), count);
            totalBookings += count;
        }
        
        statistics.put("totalBookings", totalBookings);
        statistics.put("bookingsByStatus", statusCounts);
        
        // Add revenue statistics if needed
        BigDecimal totalRevenue = bookingRepository.getTotalRevenueByOrganizer(organizerId, eventId);
        statistics.put("totalRevenue", totalRevenue);
        
        return statistics;
    }
    
    /**
     * Release event capacity when bookings are cancelled or expired
     */
    private void releaseEventCapacity(EventEntity event, int capacityToRelease) {
        log.info("Releasing {} capacity for event {}", capacityToRelease, event.getId());
        
        int newAvailable = event.getAvailable() + capacityToRelease;
        // Ensure we don't exceed maximum capacity
        int maxCapacity = event.getCapacity();
        if (newAvailable > maxCapacity) {
            log.warn("Trying to release more capacity than maximum for event {}: {} > {}", 
                    event.getId(), newAvailable, maxCapacity);
            newAvailable = maxCapacity;
        }
        
        event.setAvailable(newAvailable);
        eventRepository.save(event);
        
        log.info("Released {} capacity for event {} - new available: {}/{}", 
                capacityToRelease, event.getId(), newAvailable, maxCapacity);
    }
    
    /**
     * Convert Page to PagedResponse
     */
    private <T> PagedResponse<T> toPagedResponse(Page<T> page) {
        return PagedResponse.<T>builder()
                .items(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .total(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}