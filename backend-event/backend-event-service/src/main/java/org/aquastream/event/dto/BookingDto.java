package org.aquastream.event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDto {
    private UUID id;
    private UUID eventId;
    private String eventTitle;
    private String eventType;
    private OrganizerDto organizer;
    private UUID userId;
    private Object status;
    private BigDecimal amount;
    private Object paymentStatus;
    private UUID paymentId;
    private Instant expiresAt;
    private UUID createdBy;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant eventDateStart;
    private Instant eventDateEnd;
    private String eventLocation;
    private Boolean expired;
    private Boolean requiresPayment;
    private Boolean canBeConfirmed;
    private Long remainingMinutes;
}

