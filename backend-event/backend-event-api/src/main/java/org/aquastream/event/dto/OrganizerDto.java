package org.aquastream.event.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class OrganizerDto {
    private UUID id;
    private String slug;
    private String name;
    private String logoUrl;
    private String description;
    private Map<String, Object> contacts;
    private String brandColor;
    private Instant createdAt;
    private Instant updatedAt;
    private Long eventCount; // Количество событий (для списков)
}