package org.aquastream.crew.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BoatDto {

    private UUID id;
    private UUID crewId;
    private String boatNumber;
    private String boatType;
    private String brand;
    private String model;
    private Integer yearManufactured;
    private BigDecimal lengthMeters;
    private Integer maxWeightKg;
    private String condition;
    private Map<String, Object> equipment;
    private String maintenanceNotes;
    private Instant lastInspection;
    private Instant createdAt;
    private Instant updatedAt;
}