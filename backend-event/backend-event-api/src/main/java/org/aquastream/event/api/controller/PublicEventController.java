package org.aquastream.event.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.aquastream.event.dto.EventDto;
import org.aquastream.event.dto.FaqItemDto;
import org.aquastream.event.dto.OrganizerDetailDto;
import org.aquastream.event.dto.OrganizerDto;
import org.aquastream.event.dto.PagedResponse;
import org.aquastream.event.dto.TeamMemberDto;
import org.aquastream.event.service.PublicEventService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Events", description = "Public event and organizer management")
public class PublicEventController {

    private final PublicEventService publicEventService;

    @Operation(summary = "Get organizers", description = "Retrieve paginated list of event organizers")
    @ApiResponse(responseCode = "200", description = "List of organizers retrieved successfully")
    @GetMapping("/organizers")
    public ResponseEntity<PagedResponse<OrganizerDto>> getOrganizers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        PagedResponse<OrganizerDto> response = publicEventService.getOrganizers(search, page, size);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get organizer details", description = "Get detailed information about specific organizer")
    @ApiResponse(responseCode = "200", description = "Organizer details retrieved successfully")
    @GetMapping("/organizers/{slug}")
    public ResponseEntity<OrganizerDetailDto> getOrganizerBySlug(@Parameter(description = "Organizer slug") @PathVariable String slug) {
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
    
    /**
     * Get team members for a specific organizer.
     */
    @Operation(summary = "Get organizer team", description = "Get team members for specific organizer")
    @ApiResponse(responseCode = "200", description = "Team members retrieved successfully")
    @GetMapping("/organizers/{slug}/team")
    public ResponseEntity<List<TeamMemberDto>> getOrganizerTeam(@Parameter(description = "Organizer slug") @PathVariable String slug) {
        List<TeamMemberDto> teamMembers = publicEventService.getOrganizerTeam(slug);
        return ResponseEntity.ok(teamMembers);
    }
    
    /**
     * Get FAQ items for a specific organizer.
     */
    @Operation(summary = "Get organizer FAQ", description = "Get FAQ items for specific organizer")
    @ApiResponse(responseCode = "200", description = "FAQ items retrieved successfully")
    @GetMapping("/organizers/{slug}/faq")
    public ResponseEntity<List<FaqItemDto>> getOrganizerFaq(@Parameter(description = "Organizer slug") @PathVariable String slug) {
        List<FaqItemDto> faqItems = publicEventService.getOrganizerFaq(slug);
        return ResponseEntity.ok(faqItems);
    }
}