package org.aquastream.event.dto;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record FavoriteEventDto(
        UUID eventId,
        UUID organizerId,
        String organizerSlug,
        String organizerName,
        String type,
        String title,
        Instant dateStart,
        Instant dateEnd,
        Map<String, Object> location,
        Double price,
        Integer capacity,
        Integer available,
        String status,
        String[] tags,
        Instant createdAt
) {}
