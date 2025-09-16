package org.aquastream.crew.api.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.crew.dto.BoatDto;
import org.aquastream.crew.service.BoatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/events/{eventId}/boats")
@RequiredArgsConstructor
@Slf4j
public class BoatController {

    private final BoatService boatService;

    @GetMapping
    public ResponseEntity<List<BoatDto>> getBoats(
            @PathVariable UUID eventId,
            @RequestParam(required = false) String boatType,
            @RequestParam(required = false) String condition) {
        
        log.info("Getting boats for event: {}, type: {}, condition: {}", 
                eventId, boatType, condition);
        
        List<BoatDto> boats = boatService.getBoats(eventId, boatType, condition);
        return ResponseEntity.ok(boats);
    }

    @GetMapping("/{boatId}")
    public ResponseEntity<BoatDto> getBoat(
            @PathVariable UUID eventId,
            @PathVariable UUID boatId) {
        
        log.info("Getting boat: {} for event: {}", boatId, eventId);
        
        BoatDto boat = boatService.getBoat(eventId, boatId);
        return ResponseEntity.ok(boat);
    }
}