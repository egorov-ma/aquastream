package org.aquastream.event.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class TeamMemberDto {
    private UUID id;
    private String name;
    private String role;
    private String photoUrl;
    private String bio;
    private Integer sortOrder;
    private Instant createdAt;
}