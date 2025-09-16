package org.aquastream.crew.api.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.crew.dto.TentDto;
import org.aquastream.crew.service.TentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/events/{eventId}/tents")
@RequiredArgsConstructor
@Slf4j
public class TentController {

    private final TentService tentService;

    @GetMapping
    public ResponseEntity<List<TentDto>> getTents(
            @PathVariable UUID eventId,
            @RequestParam(required = false) String tentType,
            @RequestParam(required = false) String seasonRating,
            @RequestParam(required = false) String condition) {
        
        log.info("Getting tents for event: {}, type: {}, season: {}, condition: {}", 
                eventId, tentType, seasonRating, condition);
        
        List<TentDto> tents = tentService.getTents(eventId, tentType, seasonRating, condition);
        return ResponseEntity.ok(tents);
    }

    @GetMapping("/{tentId}")
    public ResponseEntity<TentDto> getTent(
            @PathVariable UUID eventId,
            @PathVariable UUID tentId) {
        
        log.info("Getting tent: {} for event: {}", tentId, eventId);
        
        TentDto tent = tentService.getTent(eventId, tentId);
        return ResponseEntity.ok(tent);
    }
}