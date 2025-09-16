package org.aquastream.event.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import org.aquastream.common.domain.BookingStatus;
import org.aquastream.common.domain.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * DTO for booking information returned to clients.
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BookingDto {
    
    private UUID id;
    private UUID eventId;
    private String eventTitle;
    private String eventType;
    private OrganizerDto organizer;
    private UUID userId;
    private BookingStatus status;
    private BigDecimal amount;
    private PaymentStatus paymentStatus;
    private UUID paymentId;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSX", timezone = "UTC")
    private Instant expiresAt;
    
    private UUID createdBy;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSX", timezone = "UTC")
    private Instant createdAt;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSX", timezone = "UTC")
    private Instant updatedAt;
    
    // Event details for booking display
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSX", timezone = "UTC")
    private Instant eventDateStart;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSX", timezone = "UTC")
    private Instant eventDateEnd;
    
    private String eventLocation;
    
    // Calculated fields
    private boolean expired;
    private boolean requiresPayment;
    private boolean canBeConfirmed;
    private Long remainingMinutes; // Minutes until expiration (for PENDING bookings)
}