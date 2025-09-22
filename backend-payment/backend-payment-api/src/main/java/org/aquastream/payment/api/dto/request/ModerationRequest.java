package org.aquastream.payment.api.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record ModerationRequest(
        @NotNull(message = "Approved status is required")
        Boolean approved,
        
        @Size(max = 500, message = "Notes must not exceed 500 characters")
        String notes,
        
        @NotNull(message = "Moderator ID is required")
        UUID moderatorId
) {}