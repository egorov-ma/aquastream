package org.aquastream.event.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.common.domain.BookingStatus;
import org.aquastream.event.dto.BookingDto;
import org.aquastream.event.dto.CreateBookingRequest;
import org.aquastream.event.dto.PagedResponse;
import org.aquastream.event.service.BookingService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * REST controller for booking management.
 * 
 * Endpoints:
 * - POST /api/v1/bookings - Create booking
 * - GET /api/v1/bookings - Get user's bookings
 * - PUT /api/v1/bookings/{id}/confirm - Confirm booking
 * - PUT /api/v1/bookings/{id}/cancel - Cancel booking
 */
@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Bookings", description = "User booking management")
public class BookingController {
    
    private final BookingService bookingService;
    
    /**
     * Create a new booking for the authenticated user
     */
    @Operation(summary = "Create booking", description = "Create a new booking for the authenticated user")
    @ApiResponse(responseCode = "201", description = "Booking created successfully")
    @ApiResponse(responseCode = "409", description = "Booking conflict - user already has active booking")
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<BookingDto> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            @RequestHeader("X-User-Id") UUID userId) {
        
        log.info("Creating booking for user {} and event {}", userId, request.getEventId());
        
        BookingDto booking = bookingService.createBooking(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }
    
    /**
     * Get bookings for the authenticated user with optional filtering
     */
    @Operation(summary = "Get user bookings", description = "Get bookings for the authenticated user with optional filtering")
    @ApiResponse(responseCode = "200", description = "Bookings retrieved successfully")
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PagedResponse<BookingDto>> getUserBookings(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<BookingDto> bookings = bookingService.getUserBookings(userId, status, pageable);
        
        return ResponseEntity.ok(bookings);
    }
    
    /**
     * Confirm a pending booking (for free events or after payment)
     */
    @Operation(summary = "Confirm booking", description = "Confirm a pending booking (for free events or after payment)")
    @ApiResponse(responseCode = "200", description = "Booking confirmed successfully")
    @ApiResponse(responseCode = "404", description = "Booking not found")
    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<BookingDto> confirmBooking(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId) {
        
        log.info("Confirming booking {} for user {}", id, userId);
        
        BookingDto booking = bookingService.confirmBooking(id, userId);
        return ResponseEntity.ok(booking);
    }
    
    /**
     * Cancel a booking
     */
    @Operation(summary = "Cancel booking", description = "Cancel a booking")
    @ApiResponse(responseCode = "200", description = "Booking cancelled successfully")
    @ApiResponse(responseCode = "404", description = "Booking not found")
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<BookingDto> cancelBooking(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId,
            @RequestParam(required = false) String reason) {
        
        log.info("Cancelling booking {} for user {} with reason: {}", id, userId, reason);
        
        BookingDto booking = bookingService.cancelBooking(id, userId, reason);
        return ResponseEntity.ok(booking);
    }
    
    /**
     * Get booking details by ID (user can only access their own bookings)
     */
    @Operation(summary = "Get booking details", description = "Get booking details by ID (user can only access their own bookings)")
    @ApiResponse(responseCode = "200", description = "Booking details retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Booking not found")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<BookingDto> getBookingById(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId) {
        
        // This will be implemented as part of the service method
        // For now, we can get user bookings and filter by ID
        Pageable singlePage = PageRequest.of(0, 1);
        PagedResponse<BookingDto> userBookings = bookingService.getUserBookings(userId, null, singlePage);
        
        BookingDto booking = userBookings.getItems().stream()
                .filter(b -> b.getId().equals(id))
                .findFirst()
                .orElse(null);
        
        if (booking == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(booking);
    }
    
    /**
     * Update booking payment status (called by payment service webhook)
     */
    @Operation(summary = "Update payment status", description = "Update booking payment status (internal service call)")
    @ApiResponse(responseCode = "200", description = "Payment status updated successfully")
    @PutMapping("/payment/{paymentId}/status")
    public ResponseEntity<BookingDto> updateBookingPaymentStatus(
            @Parameter(description = "Payment ID") @PathVariable UUID paymentId,
            @RequestBody Map<String, String> request) {
        
        String paymentStatus = request.get("paymentStatus");
        log.info("Updating booking payment status for payment {} to {}", paymentId, paymentStatus);
        
        BookingDto booking = bookingService.updateBookingPaymentStatus(paymentId, 
                org.aquastream.common.domain.PaymentStatus.valueOf(paymentStatus));
        
        return ResponseEntity.ok(booking);
    }
    
    /**
     * Confirm booking after successful payment (called by payment service)
     */
    @Operation(summary = "Confirm booking after payment", description = "Confirm booking after successful payment (internal service call)")
    @ApiResponse(responseCode = "200", description = "Booking confirmed successfully")
    @PutMapping("/payment/{paymentId}/confirm")
    public ResponseEntity<BookingDto> confirmBookingAfterPayment(
            @Parameter(description = "Payment ID") @PathVariable UUID paymentId) {
        
        log.info("Confirming booking after successful payment for payment {}", paymentId);
        
        BookingDto booking = bookingService.confirmBookingAfterPayment(paymentId);
        
        return ResponseEntity.ok(booking);
    }
}