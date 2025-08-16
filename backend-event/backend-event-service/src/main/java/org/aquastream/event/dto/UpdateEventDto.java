package org.aquastream.event.dto;

import lombok.Data;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

@Data
public class UpdateEventDto {
    
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;
    
    private Instant dateStart;
    
    private Instant dateEnd;
    
    private Map<String, Object> location;
    
    @DecimalMin(value = "0.0", inclusive = true, message = "Price must be non-negative")
    private BigDecimal price;
    
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;
    
    private String[] tags;
    
    private String description;
}