package org.aquastream.event.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class EventDto {
    private UUID id;
    private String type;
    private String title;
    private Instant dateStart;
    private Instant dateEnd;
    private Map<String, Object> location;
    private BigDecimal price;
    private Integer capacity;
    private Integer available;
    private String status;
    private String[] tags;
    private String description;
    private Instant createdAt;
    private Instant updatedAt;
    
    // Для детального просмотра события
    private OrganizerDto organizer;
}