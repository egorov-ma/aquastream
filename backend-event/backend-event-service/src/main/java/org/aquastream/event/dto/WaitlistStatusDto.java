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
public class WaitlistStatusDto {
    private UUID id;
    private UUID eventId;
    private UUID userId;
    private int position;
    private long totalInQueue;
    private Instant joinedAt;
    private boolean notified;
    private Instant notifiedAt;
    private Instant notificationExpiresAt;
    private String status;
}

