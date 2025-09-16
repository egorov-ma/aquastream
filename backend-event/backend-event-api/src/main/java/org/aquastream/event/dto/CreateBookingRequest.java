package org.aquastream.event.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

/**
 * Request DTO for creating a new booking.
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CreateBookingRequest {
    
    @NotNull(message = "Event ID is required")
    private UUID eventId;
    
    // Optional: for admin bookings where admin creates booking for another user
    private UUID userId;
    
    // Optional: special booking requests or notes
    private String notes;
}