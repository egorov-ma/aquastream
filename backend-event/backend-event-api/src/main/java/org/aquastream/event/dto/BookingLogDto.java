package org.aquastream.event.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import org.aquastream.event.db.entity.BookingLogEntity;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO for booking audit log entries.
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BookingLogDto {
    
    private UUID id;
    private UUID bookingId;
    private BookingLogEntity.BookingLogAction action;
    private JsonNode oldValue;
    private JsonNode newValue;
    private UUID actorUserId;
    private String actorUsername; // Resolved from user service
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSX", timezone = "UTC")
    private Instant createdAt;
}