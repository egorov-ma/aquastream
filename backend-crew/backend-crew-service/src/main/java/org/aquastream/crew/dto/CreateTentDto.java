package org.aquastream.crew.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTentDto {

    @Size(max = 20, message = "Tent number must not exceed 20 characters")
    private String tentNumber;

    @NotBlank(message = "Tent type is required")
    @Size(max = 50, message = "Tent type must not exceed 50 characters")
    private String tentType;

    @Size(max = 100, message = "Brand must not exceed 100 characters")
    private String brand;

    @Size(max = 100, message = "Model must not exceed 100 characters")
    private String model;

    @NotNull(message = "Capacity is required")
    @Positive(message = "Capacity must be positive")
    private Integer capacityPersons;

    private String seasonRating;

    private Integer waterproofRating;

    private String setupDifficulty;

    private BigDecimal weightKg;

    @Size(max = 50, message = "Packed size must not exceed 50 characters")
    private String packedSizeCm;

    private String condition;

    private Map<String, Object> equipment;

    private String maintenanceNotes;
}