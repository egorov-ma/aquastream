package org.aquastream.event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizerDto {
    private UUID id;
    private String slug;
    private String name;
    private String logoUrl;
    private Object description;
    private Object contacts;
    private String brandColor;
    private Instant createdAt;
    private Instant updatedAt;
    private Long eventCount;
}

