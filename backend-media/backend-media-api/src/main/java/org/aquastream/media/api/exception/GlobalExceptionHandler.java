package org.aquastream.media.api.exception;

import lombok.extern.slf4j.Slf4j;
import org.aquastream.media.service.storage.MinioStorageService;
import org.aquastream.media.service.validation.FileValidationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.net.URI;
import java.time.Instant;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(FileValidationService.FileValidationException.class)
    public ResponseEntity<ProblemDetail> handleFileValidation(
            FileValidationService.FileValidationException ex, WebRequest request) {
        
        log.warn("File validation error: {}", ex.getMessage());
        
        HttpStatus status = switch (ex.getErrorType()) {
            case PAYLOAD_TOO_LARGE -> HttpStatus.PAYLOAD_TOO_LARGE;
            case UNSUPPORTED_MEDIA_TYPE -> HttpStatus.UNSUPPORTED_MEDIA_TYPE;
        };
        
        String type = switch (ex.getErrorType()) {
            case PAYLOAD_TOO_LARGE -> "https://aquastream.org/problems/media.file-too-large";
            case UNSUPPORTED_MEDIA_TYPE -> "https://aquastream.org/problems/media.unsupported-type";
        };
        
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(status, ex.getMessage());
        problemDetail.setType(URI.create(type));
        problemDetail.setTitle(ex.getErrorType().name().replace("_", " ").toLowerCase());
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("path", request.getDescription(false));
        
        return ResponseEntity.status(status).body(problemDetail);
    }

    @ExceptionHandler(MinioStorageService.StorageException.class)
    public ResponseEntity<ProblemDetail> handleStorageException(
            MinioStorageService.StorageException ex, WebRequest request) {
        
        log.error("Storage service error", ex);
        
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.SERVICE_UNAVAILABLE, "Storage service temporarily unavailable");
        problemDetail.setType(URI.create("https://aquastream.org/problems/media.storage-unavailable"));
        problemDetail.setTitle("Storage Service Unavailable");
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("path", request.getDescription(false));
        
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(problemDetail);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ProblemDetail> handleIllegalArgument(
            IllegalArgumentException ex, WebRequest request) {
        
        log.warn("Invalid argument: {}", ex.getMessage());
        
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, ex.getMessage());
        problemDetail.setType(URI.create("https://aquastream.org/problems/media.invalid-request"));
        problemDetail.setTitle("Invalid Request");
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("path", request.getDescription(false));
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problemDetail);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> handleGenericException(
            Exception ex, WebRequest request) {
        
        log.error("Unexpected error occurred", ex);
        
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
        problemDetail.setType(URI.create("https://aquastream.org/problems/internal-server-error"));
        problemDetail.setTitle("Internal Server Error");
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("path", request.getDescription(false));
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(problemDetail);
    }
}