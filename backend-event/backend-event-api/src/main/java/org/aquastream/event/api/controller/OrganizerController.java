package org.aquastream.event.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.common.domain.BookingStatus;
import org.aquastream.event.dto.*;
import org.aquastream.event.service.BookingService;
import org.aquastream.event.service.OrganizerManagementService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for organizer management of bookings.
 * Provides admin functionality for organizers to manage bookings for their events.
 */
@RestController
@RequestMapping("/api/v1/organizer")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Organizer Admin", description = "Admin functionality for event organizers")
public class OrganizerController {
    
    private final BookingService bookingService;
    private final OrganizerManagementService organizerManagementService;
    
    /**
     * Get bookings for organizer's events with filtering options
     */
    @Operation(summary = "Get organizer bookings", description = "Get all bookings for events organized by the current user")
    @ApiResponse(responseCode = "200", description = "Bookings retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Access denied - user is not an organizer")
    @GetMapping("/bookings")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<PagedResponse<BookingDto>> getOrganizerBookings(
            @RequestHeader("X-User-Id") UUID organizerId,
            @Parameter(description = "Filter by event ID") @RequestParam(required = false) UUID eventId,
            @Parameter(description = "Filter by booking status") @RequestParam(required = false) BookingStatus status,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        
        log.info("Getting bookings for organizer {} with filters - eventId: {}, status: {}", 
                organizerId, eventId, status);
        
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<BookingDto> bookings = bookingService.getBookingsByOrganizer(
                organizerId, eventId, status, pageable);
        
        return ResponseEntity.ok(bookings);
    }
    
    /**
     * Update booking status (organizer can change status of bookings for their events)
     */
    @Operation(summary = "Update booking status", description = "Change the status of a booking (organizer only)")
    @ApiResponse(responseCode = "200", description = "Booking status updated successfully")
    @ApiResponse(responseCode = "403", description = "Access denied - not authorized to modify this booking")
    @ApiResponse(responseCode = "404", description = "Booking not found")
    @PutMapping("/bookings/{bookingId}/status")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<BookingDto> updateBookingStatus(
            @Parameter(description = "Booking ID") @PathVariable UUID bookingId,
            @RequestHeader("X-User-Id") UUID organizerId,
            @Parameter(description = "New booking status") @RequestParam BookingStatus status,
            @Parameter(description = "Optional reason for status change") @RequestParam(required = false) String reason) {
        
        log.info("Organizer {} updating booking {} status to {} with reason: {}", 
                organizerId, bookingId, status, reason);
        
        BookingDto updatedBooking = bookingService.updateBookingStatus(
                bookingId, status, organizerId, reason);
        
        return ResponseEntity.ok(updatedBooking);
    }
    
    /**
     * Get detailed booking information for organizer's events
     */
    @Operation(summary = "Get booking details", description = "Get detailed information about a booking (organizer only)")
    @ApiResponse(responseCode = "200", description = "Booking details retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Access denied - not authorized to view this booking")
    @ApiResponse(responseCode = "404", description = "Booking not found")
    @GetMapping("/bookings/{bookingId}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<BookingDto> getBookingDetails(
            @Parameter(description = "Booking ID") @PathVariable UUID bookingId,
            @RequestHeader("X-User-Id") UUID organizerId) {
        
        log.info("Organizer {} requesting details for booking {}", organizerId, bookingId);
        
        BookingDto booking = bookingService.getBookingForOrganizer(bookingId, organizerId);
        
        return ResponseEntity.ok(booking);
    }
    
    /**
     * Get booking statistics for organizer's events
     */
    @Operation(summary = "Get booking statistics", description = "Get aggregated statistics for organizer's events")
    @ApiResponse(responseCode = "200", description = "Statistics retrieved successfully")
    @GetMapping("/bookings/statistics")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<?> getBookingStatistics(
            @RequestHeader("X-User-Id") UUID organizerId,
            @Parameter(description = "Filter by event ID") @RequestParam(required = false) UUID eventId) {
        
        log.info("Getting booking statistics for organizer {} and event {}", organizerId, eventId);
        
        // This would return aggregated statistics like:
        // - Total bookings count
        // - Bookings by status
        // - Revenue statistics
        // - Popular events
        var statistics = bookingService.getBookingStatistics(organizerId, eventId);
        
        return ResponseEntity.ok(statistics);
    }
    
    // Team Management Endpoints
    
    /**
     * Get team members for the organizer
     */
    @Operation(summary = "Get team members", description = "Get all team members for the organizer")
    @ApiResponse(responseCode = "200", description = "Team members retrieved successfully")
    @GetMapping("/team")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<List<TeamMemberDto>> getTeamMembers(
            @RequestHeader("X-User-Id") UUID organizerId) {
        
        log.info("Getting team members for organizer {}", organizerId);
        List<TeamMemberDto> teamMembers = organizerManagementService.getOrganizerTeamMembers(organizerId);
        
        return ResponseEntity.ok(teamMembers);
    }
    
    /**
     * Create a new team member
     */
    @Operation(summary = "Create team member", description = "Create a new team member")
    @ApiResponse(responseCode = "201", description = "Team member created successfully")
    @PostMapping("/team")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<TeamMemberDto> createTeamMember(
            @RequestHeader("X-User-Id") UUID organizerId,
            @Valid @RequestBody CreateTeamMemberRequest request) {
        
        log.info("Creating team member for organizer {}: {}", organizerId, request.getName());
        TeamMemberDto teamMember = organizerManagementService.createTeamMember(organizerId, request);
        
        return ResponseEntity.status(201).body(teamMember);
    }
    
    /**
     * Update a team member
     */
    @Operation(summary = "Update team member", description = "Update an existing team member")
    @ApiResponse(responseCode = "200", description = "Team member updated successfully")
    @ApiResponse(responseCode = "404", description = "Team member not found")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @PutMapping("/team/{teamMemberId}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<TeamMemberDto> updateTeamMember(
            @RequestHeader("X-User-Id") UUID organizerId,
            @Parameter(description = "Team member ID") @PathVariable UUID teamMemberId,
            @Valid @RequestBody UpdateTeamMemberRequest request) {
        
        log.info("Updating team member {} for organizer {}", teamMemberId, organizerId);
        TeamMemberDto teamMember = organizerManagementService.updateTeamMember(organizerId, teamMemberId, request);
        
        return ResponseEntity.ok(teamMember);
    }
    
    /**
     * Delete a team member
     */
    @Operation(summary = "Delete team member", description = "Delete an existing team member")
    @ApiResponse(responseCode = "204", description = "Team member deleted successfully")
    @ApiResponse(responseCode = "404", description = "Team member not found")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @DeleteMapping("/team/{teamMemberId}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<Void> deleteTeamMember(
            @RequestHeader("X-User-Id") UUID organizerId,
            @Parameter(description = "Team member ID") @PathVariable UUID teamMemberId) {
        
        log.info("Deleting team member {} for organizer {}", teamMemberId, organizerId);
        organizerManagementService.deleteTeamMember(organizerId, teamMemberId);
        
        return ResponseEntity.noContent().build();
    }
    
    // FAQ Management Endpoints
    
    /**
     * Get FAQ items for the organizer
     */
    @Operation(summary = "Get FAQ items", description = "Get all FAQ items for the organizer")
    @ApiResponse(responseCode = "200", description = "FAQ items retrieved successfully")
    @GetMapping("/faq")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<List<FaqItemDto>> getFaqItems(
            @RequestHeader("X-User-Id") UUID organizerId) {
        
        log.info("Getting FAQ items for organizer {}", organizerId);
        List<FaqItemDto> faqItems = organizerManagementService.getOrganizerFaqItems(organizerId);
        
        return ResponseEntity.ok(faqItems);
    }
    
    /**
     * Create a new FAQ item
     */
    @Operation(summary = "Create FAQ item", description = "Create a new FAQ item")
    @ApiResponse(responseCode = "201", description = "FAQ item created successfully")
    @PostMapping("/faq")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<FaqItemDto> createFaqItem(
            @RequestHeader("X-User-Id") UUID organizerId,
            @Valid @RequestBody CreateFaqItemRequest request) {
        
        log.info("Creating FAQ item for organizer {}: {}", organizerId, request.getQuestion());
        FaqItemDto faqItem = organizerManagementService.createFaqItem(organizerId, request);
        
        return ResponseEntity.status(201).body(faqItem);
    }
    
    /**
     * Update a FAQ item
     */
    @Operation(summary = "Update FAQ item", description = "Update an existing FAQ item")
    @ApiResponse(responseCode = "200", description = "FAQ item updated successfully")
    @ApiResponse(responseCode = "404", description = "FAQ item not found")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @PutMapping("/faq/{faqItemId}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<FaqItemDto> updateFaqItem(
            @RequestHeader("X-User-Id") UUID organizerId,
            @Parameter(description = "FAQ item ID") @PathVariable UUID faqItemId,
            @Valid @RequestBody UpdateFaqItemRequest request) {
        
        log.info("Updating FAQ item {} for organizer {}", faqItemId, organizerId);
        FaqItemDto faqItem = organizerManagementService.updateFaqItem(organizerId, faqItemId, request);
        
        return ResponseEntity.ok(faqItem);
    }
    
    /**
     * Delete a FAQ item
     */
    @Operation(summary = "Delete FAQ item", description = "Delete an existing FAQ item")
    @ApiResponse(responseCode = "204", description = "FAQ item deleted successfully")
    @ApiResponse(responseCode = "404", description = "FAQ item not found")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @DeleteMapping("/faq/{faqItemId}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<Void> deleteFaqItem(
            @RequestHeader("X-User-Id") UUID organizerId,
            @Parameter(description = "FAQ item ID") @PathVariable UUID faqItemId) {
        
        log.info("Deleting FAQ item {} for organizer {}", faqItemId, organizerId);
        organizerManagementService.deleteFaqItem(organizerId, faqItemId);
        
        return ResponseEntity.noContent().build();
    }
}