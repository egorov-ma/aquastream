package org.aquastream.crew.api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAssignmentDto {

    @NotNull(message = "Crew ID is required")
    private UUID crewId;

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotNull(message = "Booking ID is required")
    private UUID bookingId;

    private Integer seatNumber;

    private String position;

    private String notes;
}