package org.aquastream.payment.service.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInitRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotNull(message = "Event ID is required")
    private UUID eventId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    private String currency = "RUB";

    private String description;

    private String returnUrl;

    private String failUrl;

    private Map<String, Object> metadata;

    // Booking information
    private UUID bookingId;
    
    private String customerEmail;
    
    private String customerPhone;
}