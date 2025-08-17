package org.aquastream.media.service.validation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.media.service.config.MediaStorageProperties;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileValidationService {

    private final MediaStorageProperties properties;

    // Supported content types
    private static final Set<String> SUPPORTED_IMAGE_TYPES = Set.of(
        "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"
    );

    private static final Set<String> SUPPORTED_DOCUMENT_TYPES = Set.of(
        "application/pdf", "application/msword", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private static final Set<String> SUPPORTED_PROOF_TYPES = Set.of(
        "application/pdf", "image/jpeg", "image/jpg", "image/png", "image/tiff"
    );

    private static final Set<String> ALL_SUPPORTED_TYPES = Set.of(
        // Images
        "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif",
        // Documents  
        "application/pdf", "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        // Special
        "image/tiff"
    );

    public void validateFile(String contentType, long contentLength, FileCategory category) {
        validateContentType(contentType);
        validateFileSize(contentType, contentLength, category);
    }

    public void validateContentType(String contentType) {
        if (contentType == null || contentType.trim().isEmpty()) {
            throw new FileValidationException("Content-Type is required", 
                    FileValidationException.ErrorType.UNSUPPORTED_MEDIA_TYPE);
        }

        String normalizedType = contentType.toLowerCase().trim();
        if (!ALL_SUPPORTED_TYPES.contains(normalizedType)) {
            log.warn("Unsupported content type: {}", contentType);
            throw new FileValidationException("Unsupported file type: " + contentType, 
                    FileValidationException.ErrorType.UNSUPPORTED_MEDIA_TYPE);
        }
    }

    public void validateFileSize(String contentType, long contentLength, FileCategory category) {
        if (contentLength <= 0) {
            throw new FileValidationException("File size must be greater than 0", 
                    FileValidationException.ErrorType.PAYLOAD_TOO_LARGE);
        }

        long maxSize = getMaxSizeForCategory(contentType, category);
        
        if (contentLength > maxSize) {
            log.warn("File size {} exceeds limit {} for type {} and category {}", 
                    contentLength, maxSize, contentType, category);
            throw new FileValidationException(
                    String.format("File size %d bytes exceeds maximum allowed %d bytes for %s files", 
                            contentLength, maxSize, category.name().toLowerCase()),
                    FileValidationException.ErrorType.PAYLOAD_TOO_LARGE);
        }
    }

    private long getMaxSizeForCategory(String contentType, FileCategory category) {
        return switch (category) {
            case PHOTO -> properties.getFiles().getMaxPhotoMb() * 1024 * 1024;
            case PROOF -> properties.getFiles().getMaxProofMb() * 1024 * 1024;
            case DOCUMENT -> properties.getFiles().getMaxDocumentMb() * 1024 * 1024;
            case VIDEO -> properties.getFiles().getMaxVideoMb() * 1024 * 1024;
        };
    }

    public FileCategory determineCategory(String contentType, String purpose) {
        if (purpose != null) {
            return switch (purpose.toLowerCase()) {
                case "avatar", "profile", "photo", "image" -> FileCategory.PHOTO;
                case "proof", "verification", "certificate" -> FileCategory.PROOF;
                case "document", "doc" -> FileCategory.DOCUMENT;
                case "video" -> FileCategory.VIDEO;
                default -> categorizeByContentType(contentType);
            };
        }
        
        return categorizeByContentType(contentType);
    }

    private FileCategory categorizeByContentType(String contentType) {
        if (SUPPORTED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            return FileCategory.PHOTO;
        } else if (SUPPORTED_DOCUMENT_TYPES.contains(contentType.toLowerCase())) {
            return FileCategory.DOCUMENT;
        } else if (contentType.startsWith("video/")) {
            return FileCategory.VIDEO;
        } else {
            return FileCategory.DOCUMENT; // Default fallback
        }
    }

    public enum FileCategory {
        PHOTO, PROOF, DOCUMENT, VIDEO
    }

    public static class FileValidationException extends RuntimeException {
        private final ErrorType errorType;

        public FileValidationException(String message, ErrorType errorType) {
            super(message);
            this.errorType = errorType;
        }

        public ErrorType getErrorType() {
            return errorType;
        }

        public enum ErrorType {
            PAYLOAD_TOO_LARGE,
            UNSUPPORTED_MEDIA_TYPE
        }
    }
}