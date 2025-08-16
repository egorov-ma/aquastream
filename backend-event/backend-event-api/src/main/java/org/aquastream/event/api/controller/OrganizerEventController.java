package org.aquastream.event.api.controller;

import lombok.RequiredArgsConstructor;
import org.aquastream.event.dto.CreateEventDto;
import org.aquastream.event.dto.EventDto;
import org.aquastream.event.dto.UpdateEventDto;
import org.aquastream.event.service.OrganizerEventService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
public class OrganizerEventController {

    private final OrganizerEventService organizerEventService;

    @PostMapping
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<EventDto> createEvent(
            @Valid @RequestBody CreateEventDto createEventDto,
            Authentication authentication) {
        
        String organizerSlug = authentication.getName(); // Assuming organizer slug is stored in principal
        EventDto createdEvent = organizerEventService.createEvent(createEventDto, organizerSlug);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEvent);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<EventDto> updateEvent(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateEventDto updateEventDto,
            Authentication authentication) {
        
        String organizerSlug = authentication.getName();
        EventDto updatedEvent = organizerEventService.updateEvent(id, updateEventDto, organizerSlug);
        return ResponseEntity.ok(updatedEvent);
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<EventDto> publishEvent(
            @PathVariable UUID id,
            Authentication authentication) {
        
        String organizerSlug = authentication.getName();
        EventDto publishedEvent = organizerEventService.publishEvent(id, organizerSlug);
        return ResponseEntity.ok(publishedEvent);
    }
}