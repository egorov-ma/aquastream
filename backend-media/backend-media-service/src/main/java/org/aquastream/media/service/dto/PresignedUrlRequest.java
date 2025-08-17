package org.aquastream.media.service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresignedUrlRequest {

    @NotBlank(message = "Content type is required")
    private String contentType;

    @NotNull(message = "Content length is required")
    @Positive(message = "Content length must be positive")
    private Long contentLength;

    @NotBlank(message = "Owner type is required")
    @Size(max = 50, message = "Owner type must not exceed 50 characters")
    private String ownerType;

    @NotNull(message = "Owner ID is required")
    private UUID ownerId;

    @Size(max = 500, message = "Original filename must not exceed 500 characters")
    private String originalFilename;

    @Size(max = 100, message = "Purpose must not exceed 100 characters")
    private String purpose; // e.g., "avatar", "proof", "document"

    private String checksum; // Optional SHA-256 hash for verification
}