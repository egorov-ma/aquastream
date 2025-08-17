package org.aquastream.media.service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PresignedUrlResponse {

    private String url;
    private String key;
    private Instant expires;
    private UUID uploadSessionId;
    private String method; // "PUT"
    
    // Instructions for the client
    private String instructions;
    
    // Additional metadata
    private Long maxSizeBytes;
    private String allowedContentType;
}