package org.aquastream.event.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class OrganizerDetailDto {
    private UUID id;
    private String slug;
    private String name;
    private String logoUrl;
    private String description;
    private Map<String, Object> contacts;
    private String brandColor;
    private Instant createdAt;
    private Instant updatedAt;
    
    // Связанные данные
    private List<EventDto> events;
    private List<TeamMemberDto> teamMembers;
    private List<FaqItemDto> faqItems;
}