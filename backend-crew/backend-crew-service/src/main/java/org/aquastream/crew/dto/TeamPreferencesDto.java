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
public class TeamPreferencesDto {

    private UUID id;
    private UUID userId;
    private UUID eventId;
    private UUID[] prefersWithUserIds;
    private UUID[] avoidsUserIds;
    private String[] preferredCrewTypes;
    private String[] preferredPositions;
    private String specialRequirements;
    private Instant createdAt;
    private Instant updatedAt;
}