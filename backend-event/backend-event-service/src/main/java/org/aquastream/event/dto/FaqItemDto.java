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
public class FaqItemDto {
    private UUID id;
    private String question;
    private String answer;
    private Integer sortOrder;
    private Instant createdAt;
    private Instant updatedAt;
}

