package org.aquastream.event.dto;

import lombok.Data;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

@Data
public class CreateEventDto {
    
    @NotBlank(message = "Event type is required")
    private String type;
    
    @NotBlank(message = "Event title is required")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;
    
    @NotNull(message = "Start date is required")
    private Instant dateStart;
    
    @NotNull(message = "End date is required")
    private Instant dateEnd;
    
    @NotNull(message = "Location is required")
    private Map<String, Object> location;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Price must be non-negative")
    private BigDecimal price;
    
    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;
    
    private String[] tags;
    
    private String description;
}