package org.aquastream.crew.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.crew.api.dto.CrewDto;
import org.aquastream.crew.api.dto.CreateCrewDto;
import org.aquastream.crew.api.service.CrewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/events/{eventId}/crews")
@RequiredArgsConstructor
@Validated
@Slf4j
public class CrewController {

    private final CrewService crewService;

    @GetMapping
    public ResponseEntity<List<CrewDto>> getCrews(
            @PathVariable UUID eventId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false, defaultValue = "false") boolean availableOnly) {
        
        log.info("Getting crews for event: {}, type: {}, availableOnly: {}", 
                eventId, type, availableOnly);
        
        List<CrewDto> crews = crewService.getCrews(eventId, type, availableOnly);
        return ResponseEntity.ok(crews);
    }

    @GetMapping("/{crewId}")
    public ResponseEntity<CrewDto> getCrew(
            @PathVariable UUID eventId,
            @PathVariable UUID crewId) {
        
        log.info("Getting crew: {} for event: {}", crewId, eventId);
        
        CrewDto crew = crewService.getCrew(eventId, crewId);
        return ResponseEntity.ok(crew);
    }

    @PostMapping
    public ResponseEntity<CrewDto> createCrew(
            @PathVariable UUID eventId,
            @Valid @RequestBody CreateCrewDto createCrewDto) {
        
        log.info("Creating crew for event: {}: {}", eventId, createCrewDto.getName());
        
        CrewDto crew = crewService.createCrew(eventId, createCrewDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(crew);
    }

    @PutMapping("/{crewId}")
    public ResponseEntity<CrewDto> updateCrew(
            @PathVariable UUID eventId,
            @PathVariable UUID crewId,
            @Valid @RequestBody CreateCrewDto updateCrewDto) {
        
        log.info("Updating crew: {} for event: {}", crewId, eventId);
        
        CrewDto crew = crewService.updateCrew(eventId, crewId, updateCrewDto);
        return ResponseEntity.ok(crew);
    }

    @DeleteMapping("/{crewId}")
    public ResponseEntity<Void> deleteCrew(
            @PathVariable UUID eventId,
            @PathVariable UUID crewId) {
        
        log.info("Deleting crew: {} for event: {}", crewId, eventId);
        
        crewService.deleteCrew(eventId, crewId);
        return ResponseEntity.noContent().build();
    }
}