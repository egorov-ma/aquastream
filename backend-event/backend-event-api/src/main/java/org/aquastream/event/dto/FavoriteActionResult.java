package org.aquastream.event.dto;

import java.util.UUID;

/**
 * DTO for favorite action results (add/remove).
 */
public record FavoriteActionResult(
        UUID eventId,
        boolean isFavorited,
        String message
) {
    
    public static FavoriteActionResult added(UUID eventId) {
        return new FavoriteActionResult(eventId, true, "Event added to favorites");
    }
    
    public static FavoriteActionResult removed(UUID eventId) {
        return new FavoriteActionResult(eventId, false, "Event removed from favorites");
    }
    
    public static FavoriteActionResult alreadyExists(UUID eventId) {
        return new FavoriteActionResult(eventId, true, "Event is already in favorites");
    }
    
    public static FavoriteActionResult notFound(UUID eventId) {
        return new FavoriteActionResult(eventId, false, "Event not found in favorites");
    }
}