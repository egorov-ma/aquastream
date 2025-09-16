package org.aquastream.event.api.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.event.dto.FavoriteActionResult;
import org.aquastream.event.dto.FavoriteEventDto;
import org.aquastream.event.service.FavoritesService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for managing user favorites.
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
public class FavoritesController {
    
    private final FavoritesService favoritesService;
    
    /**
     * Add event to favorites.
     */
    @PostMapping("/events/{eventId}/favorite")
    @PreAuthorize("hasRole('USER') or hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<FavoriteActionResult> addToFavorites(
            @PathVariable UUID eventId,
            @RequestHeader("X-User-Id") UUID userId) {
        
        log.debug("Adding event {} to favorites for user {}", eventId, userId);
        FavoriteActionResult result = favoritesService.addToFavorites(userId, eventId);
        return ResponseEntity.ok(result);
    }
    
    /**
     * Remove event from favorites.
     */
    @DeleteMapping("/events/{eventId}/favorite")
    @PreAuthorize("hasRole('USER') or hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<FavoriteActionResult> removeFromFavorites(
            @PathVariable UUID eventId,
            @RequestHeader("X-User-Id") UUID userId) {
        
        log.debug("Removing event {} from favorites for user {}", eventId, userId);
        FavoriteActionResult result = favoritesService.removeFromFavorites(userId, eventId);
        return ResponseEntity.ok(result);
    }
    
    /**
     * Get user's favorite events.
     */
    @GetMapping("/profile/favorites")
    @PreAuthorize("hasRole('USER') or hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<List<FavoriteEventDto>> getUserFavorites(
            @RequestHeader("X-User-Id") UUID userId) {
        
        log.debug("Getting favorites for user {}", userId);
        List<FavoriteEventDto> favorites = favoritesService.getUserFavorites(userId);
        return ResponseEntity.ok(favorites);
    }
    
    /**
     * Check if event is favorited.
     */
    @GetMapping("/events/{eventId}/favorite/status")
    @PreAuthorize("hasRole('USER') or hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<Boolean> isFavorited(
            @PathVariable UUID eventId,
            @RequestHeader("X-User-Id") UUID userId) {
        
        log.debug("Checking if event {} is favorited by user {}", eventId, userId);
        boolean isFavorited = favoritesService.isFavorited(userId, eventId);
        return ResponseEntity.ok(isFavorited);
    }
    
    /**
     * Get event favorite count.
     */
    @GetMapping("/events/{eventId}/favorites/count")
    public ResponseEntity<Long> getFavoriteCount(@PathVariable UUID eventId) {
        
        log.debug("Getting favorite count for event {}", eventId);
        Long count = favoritesService.getFavoriteCount(eventId);
        return ResponseEntity.ok(count);
    }
    
    /**
     * Get user's favorite count.
     */
    @GetMapping("/profile/favorites/count")
    @PreAuthorize("hasRole('USER') or hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<Long> getUserFavoriteCount(@RequestHeader("X-User-Id") UUID userId) {
        
        log.debug("Getting favorite count for user {}", userId);
        Long count = favoritesService.getUserFavoriteCount(userId);
        return ResponseEntity.ok(count);
    }
}