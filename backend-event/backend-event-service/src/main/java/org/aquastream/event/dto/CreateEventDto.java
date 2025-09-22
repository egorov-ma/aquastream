package org.aquastream.event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateEventDto {
    private String type;
    private String title;
    private Instant dateStart;
    private Instant dateEnd;
    private Map<String, Object> location;
    private BigDecimal price;
    private Integer capacity;
    private String[] tags;
    private String description;
}

