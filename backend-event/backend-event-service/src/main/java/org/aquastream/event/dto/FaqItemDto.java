package org.aquastream.event.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class FaqItemDto {
    private UUID id;
    private String question;
    private String answer;
    private Integer sortOrder;
    private Instant createdAt;
    private Instant updatedAt;
}