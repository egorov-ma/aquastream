package org.aquastream.event.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.aquastream.event.dto.JoinWaitlistDto;
import org.aquastream.event.dto.WaitlistStatusDto;
import org.aquastream.event.service.WaitlistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
public class WaitlistController {

    private final WaitlistService waitlistService;

    @PostMapping("/{eventId}/waitlist")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<WaitlistStatusDto> joinWaitlist(
            @PathVariable UUID eventId,
            Authentication authentication) {
        
        UUID userId = getUserIdFromAuth(authentication);
        WaitlistStatusDto status = waitlistService.joinWaitlist(eventId, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(status);
    }

    @DeleteMapping("/{eventId}/waitlist")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> leaveWaitlist(
            @PathVariable UUID eventId,
            Authentication authentication) {
        
        UUID userId = getUserIdFromAuth(authentication);
        waitlistService.leaveWaitlist(eventId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{eventId}/waitlist/status")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<WaitlistStatusDto> getWaitlistStatus(
            @PathVariable UUID eventId,
            Authentication authentication) {
        
        UUID userId = getUserIdFromAuth(authentication);
        return waitlistService.getWaitlistStatus(eventId, userId)
                .map(status -> ResponseEntity.ok(status))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/waitlist")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<WaitlistStatusDto>> getUserWaitlists(Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        List<WaitlistStatusDto> waitlists = waitlistService.getUserWaitlists(userId);
        return ResponseEntity.ok(waitlists);
    }

    @PostMapping("/{eventId}/waitlist/{userId}/notify")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<WaitlistStatusDto> notifyNextInLine(
            @PathVariable UUID eventId,
            @PathVariable UUID userId,
            Authentication authentication) {
        
        // Verify organizer owns this event
        WaitlistStatusDto status = waitlistService.notifyNextInLine(eventId, authentication.getName());
        return ResponseEntity.ok(status);
    }

    private UUID getUserIdFromAuth(Authentication authentication) {
        // TODO: Extract user ID from JWT token
        // For now, assuming user ID is in the principal name
        try {
            return UUID.fromString(authentication.getName());
        } catch (IllegalArgumentException e) {
            // Fallback: generate a mock UUID based on username for testing
            return UUID.nameUUIDFromBytes(authentication.getName().getBytes());
        }
    }
}