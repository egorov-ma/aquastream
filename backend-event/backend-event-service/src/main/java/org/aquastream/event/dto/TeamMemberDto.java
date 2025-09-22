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
public class TeamMemberDto {
    private UUID id;
    private String name;
    private String role;
    private String photoUrl;
    private String bio;
    private Integer sortOrder;
    private Instant createdAt;
}

