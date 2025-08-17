package org.aquastream.crew.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CrewDto {

    private UUID id;
    private UUID eventId;
    private String name;
    private String type;
    private Integer capacity;
    private Integer currentSize;
    private String description;
    private Map<String, Object> metadata;
    private BoatDto boat;
    private TentDto tent;
    private Instant createdAt;
    private Instant updatedAt;
}