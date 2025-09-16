package org.aquastream.event.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class JoinWaitlistDto {
    @NotNull(message = "Event ID is required")
    private UUID eventId;
}