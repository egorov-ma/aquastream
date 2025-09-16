package org.aquastream.crew.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CrewAssignmentDto {

    private UUID id;
    private UUID crewId;
    private UUID userId;
    private UUID bookingId;
    private Integer seatNumber;
    private String position;
    private UUID assignedBy;
    private Instant assignedAt;
    private Instant unassignedAt;
    private String status;
    private String notes;
    private CrewDto crew;
    private Instant createdAt;
}