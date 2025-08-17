package org.aquastream.media.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.media.service.dto.PresignedUrlRequest;
import org.aquastream.media.service.dto.PresignedUrlResponse;
import org.aquastream.media.db.entity.MediaFileEntity;
import org.aquastream.media.db.repository.MediaFileRepository;
import org.aquastream.media.service.config.MediaStorageProperties;
import org.aquastream.media.service.storage.StorageService;
import org.aquastream.media.service.validation.FileValidationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MediaService {

    private final StorageService storageService;
    private final FileValidationService validationService;
    private final MediaFileRepository mediaFileRepository;
    private final MediaStorageProperties properties;

    public PresignedUrlResponse generatePresignedUploadUrl(PresignedUrlRequest request) {
        log.info("Generating presigned upload URL for owner: {}/{}, content-type: {}, size: {}", 
                request.getOwnerType(), request.getOwnerId(), request.getContentType(), request.getContentLength());

        // Validate request
        FileValidationService.FileCategory category = validationService.determineCategory(
                request.getContentType(), request.getPurpose());
        
        validationService.validateFile(request.getContentType(), request.getContentLength(), category);

        // Generate unique key
        String key = generateFileKey(request);
        
        // Check if key already exists
        if (mediaFileRepository.existsByKey(key)) {
            throw new IllegalArgumentException("File with this key already exists: " + key);
        }

        // Generate upload session ID
        UUID uploadSessionId = UUID.randomUUID();

        // Create database record in UPLOADING status
        MediaFileEntity fileEntity = MediaFileEntity.builder()
                .key(key)
                .ownerType(request.getOwnerType())
                .ownerId(request.getOwnerId())
                .contentType(request.getContentType())
                .sizeBytes(request.getContentLength())
                .originalFilename(request.getOriginalFilename())
                .uploadSessionId(uploadSessionId)
                .checksum(request.getChecksum())
                .status(MediaFileEntity.FileStatus.UPLOADING)
                .visibility(determineVisibility(request.getPurpose()))
                .expiresAt(determineExpirationTime(category))
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        mediaFileRepository.save(fileEntity);

        // Generate presigned URL
        String presignedUrl = storageService.generatePresignedUploadUrl(
                key, request.getContentType(), request.getContentLength());

        Instant expires = Instant.now().plus(properties.getPresignedUrl().getUploadExpiry());

        return PresignedUrlResponse.builder()
                .url(presignedUrl)
                .key(key)
                .expires(expires)
                .uploadSessionId(uploadSessionId)
                .method("PUT")
                .instructions("Upload file using PUT method with Content-Type: " + request.getContentType())
                .maxSizeBytes(request.getContentLength())
                .allowedContentType(request.getContentType())
                .build();
    }

    @Transactional(readOnly = true)
    public PresignedUrlResponse generatePresignedDownloadUrl(String key) {
        log.debug("Generating presigned download URL for key: {}", key);

        MediaFileEntity fileEntity = mediaFileRepository.findByKey(key)
                .orElseThrow(() -> new IllegalArgumentException("File not found: " + key));

        if (fileEntity.getStatus() != MediaFileEntity.FileStatus.READY) {
            throw new IllegalArgumentException("File is not ready for download: " + key);
        }

        String presignedUrl = storageService.generatePresignedDownloadUrl(key);
        Instant expires = Instant.now().plus(properties.getPresignedUrl().getDownloadExpiry());

        return PresignedUrlResponse.builder()
                .url(presignedUrl)
                .key(key)
                .expires(expires)
                .method("GET")
                .build();
    }

    public void markFileAsUploaded(String key, String actualChecksum) {
        log.info("Marking file as uploaded: {}", key);

        MediaFileEntity fileEntity = mediaFileRepository.findByKey(key)
                .orElseThrow(() -> new IllegalArgumentException("File not found: " + key));

        if (fileEntity.getStatus() != MediaFileEntity.FileStatus.UPLOADING) {
            throw new IllegalArgumentException("File is not in uploading status: " + key);
        }

        // Verify checksum if provided
        if (fileEntity.getChecksum() != null && actualChecksum != null) {
            if (!fileEntity.getChecksum().equals(actualChecksum)) {
                throw new IllegalArgumentException("Checksum mismatch for file: " + key);
            }
        }

        fileEntity.setStatus(MediaFileEntity.FileStatus.UPLOADED);
        fileEntity.setChecksum(actualChecksum != null ? actualChecksum : fileEntity.getChecksum());
        fileEntity.setUpdatedAt(Instant.now());

        mediaFileRepository.save(fileEntity);
    }

    private String generateFileKey(PresignedUrlRequest request) {
        String timestamp = String.valueOf(Instant.now().toEpochMilli());
        String filename = request.getOriginalFilename() != null ? 
                sanitizeFilename(request.getOriginalFilename()) : 
                "file-" + timestamp;
        
        String extension = getFileExtension(request.getContentType());
        if (!filename.toLowerCase().endsWith(extension)) {
            filename += extension;
        }

        return String.format("%s/%s/%s/%s",
                request.getOwnerType(),
                request.getOwnerId(),
                request.getPurpose() != null ? request.getPurpose() : "general",
                filename);
    }

    private String sanitizeFilename(String filename) {
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private String getFileExtension(String contentType) {
        return switch (contentType.toLowerCase()) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            case "application/pdf" -> ".pdf";
            case "image/tiff" -> ".tiff";
            default -> "";
        };
    }

    private MediaFileEntity.FileVisibility determineVisibility(String purpose) {
        if (purpose != null) {
            return switch (purpose.toLowerCase()) {
                case "avatar", "profile" -> MediaFileEntity.FileVisibility.PUBLIC;
                case "proof", "verification" -> MediaFileEntity.FileVisibility.PRIVATE;
                default -> MediaFileEntity.FileVisibility.PRIVATE;
            };
        }
        return MediaFileEntity.FileVisibility.PRIVATE;
    }

    private Instant determineExpirationTime(FileValidationService.FileCategory category) {
        if (category == FileValidationService.FileCategory.PROOF) {
            return Instant.now().plusSeconds(
                    properties.getRetention().getProofsDays() * 24L * 60L * 60L);
        }
        return null; // No expiration for other types
    }
}