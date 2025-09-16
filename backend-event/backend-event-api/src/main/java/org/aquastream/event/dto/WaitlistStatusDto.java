package org.aquastream.event.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class WaitlistStatusDto {
    private UUID id;
    private UUID eventId;
    private UUID userId;
    private Integer position; // Position in queue (1-based)
    private Long totalInQueue;
    private Instant joinedAt;
    private boolean notified;
    private Instant notifiedAt;
    private Instant notificationExpiresAt;
    private String status; // WAITING, NOTIFIED, EXPIRED
}