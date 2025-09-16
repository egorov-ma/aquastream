package org.aquastream.crew.dto;

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
public class TentDto {

    private UUID id;
    private UUID crewId;
    private String tentNumber;
    private String tentType;
    private String brand;
    private String model;
    private Integer capacityPersons;
    private String seasonRating;
    private Integer waterproofRating;
    private String setupDifficulty;
    private BigDecimal weightKg;
    private String packedSizeCm;
    private String condition;
    private Map<String, Object> equipment;
    private String maintenanceNotes;
    private Instant createdAt;
    private Instant updatedAt;
}