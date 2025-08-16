package org.aquastream.event.api.controller;

import lombok.RequiredArgsConstructor;
import org.aquastream.event.dto.EventDto;
import org.aquastream.event.dto.OrganizerDetailDto;
import org.aquastream.event.dto.OrganizerDto;
import org.aquastream.event.dto.PagedResponse;
import org.aquastream.event.service.PublicEventService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class PublicEventController {

    private final PublicEventService publicEventService;

    @GetMapping("/organizers")
    public ResponseEntity<PagedResponse<OrganizerDto>> getOrganizers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        PagedResponse<OrganizerDto> response = publicEventService.getOrganizers(search, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/organizers/{slug}")
    public ResponseEntity<OrganizerDetailDto> getOrganizerBySlug(@PathVariable String slug) {
        OrganizerDetailDto organizer = publicEventService.getOrganizerBySlug(slug);
        return ResponseEntity.ok(organizer);
    }

    @GetMapping("/organizers/{slug}/events")
    public ResponseEntity<PagedResponse<EventDto>> getOrganizerEvents(
            @PathVariable String slug,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        PagedResponse<EventDto> response = publicEventService.getOrganizerEvents(
                slug, status, type, minPrice, maxPrice, dateFrom, dateTo, page, size
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/events/{id}")
    public ResponseEntity<EventDto> getEventById(@PathVariable UUID id) {
        EventDto event = publicEventService.getEventById(id);
        return ResponseEntity.ok(event);
    }

    @GetMapping("/events")
    public ResponseEntity<PagedResponse<EventDto>> getEvents(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant dateTo,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        PagedResponse<EventDto> response = publicEventService.getEvents(
                status, type, minPrice, maxPrice, dateFrom, dateTo, search, page, size
        );
        return ResponseEntity.ok(response);
    }
}