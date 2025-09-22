package org.aquastream.event.dto;

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
public class BookingLogDto {
    private UUID id;
    private UUID bookingId;
    private Object action;
    private Object oldValue;
    private Object newValue;
    private UUID actorUserId;
    private Instant createdAt;
}

