package org.aquastream.event.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO for favorite event information.
 * 
 * Contains event details plus favorite-specific metadata.
 */
public record FavoriteEventDto(
        UUID eventId,
        UUID organizerId,
        String organizerSlug,
        String organizerName,
        String type,
        String title,
        
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSSSS'Z'")
        Instant dateStart,
        
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSSSS'Z'")
        Instant dateEnd,
        
        Object location, // JSONB from database
        Double price,
        Integer capacity,
        Integer available,
        String status,
        String[] tags,
        
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSSSS'Z'")
        Instant favoritedAt // When user added to favorites
) {
    
    /**
     * Check if event has available spots.
     */
    public boolean hasAvailableSpots() {
        return available != null && available > 0;
    }
    
    /**
     * Check if event is free.
     */
    public boolean isFree() {
        return price == null || price <= 0.0;
    }
    
    /**
     * Check if event is published and bookable.
     */
    public boolean isBookable() {
        return "PUBLISHED".equals(status) && hasAvailableSpots();
    }
}