package org.aquastream.crew.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
public class CreateBoatDto {

    @Size(max = 20, message = "Boat number must not exceed 20 characters")
    private String boatNumber;

    @NotBlank(message = "Boat type is required")
    @Size(max = 50, message = "Boat type must not exceed 50 characters")
    private String boatType;

    @Size(max = 100, message = "Brand must not exceed 100 characters")
    private String brand;

    @Size(max = 100, message = "Model must not exceed 100 characters")
    private String model;

    private Integer yearManufactured;

    private BigDecimal lengthMeters;

    private Integer maxWeightKg;

    private String condition;

    private Map<String, Object> equipment;

    private String maintenanceNotes;

    private Instant lastInspection;
}