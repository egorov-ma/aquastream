package org.aquastream.payment.api.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ProblemDetail> handleResponseStatusException(
            ResponseStatusException ex, WebRequest request) {
        
        log.warn("Response status exception: {}", ex.getMessage());
        
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(ex.getStatusCode(), ex.getReason());
        problemDetail.setType(URI.create("https://aquastream.org/problems/payment.error"));
        problemDetail.setTitle(getStatusTitle(ex.getStatusCode().value()));
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("path", request.getDescription(false));
        
        return ResponseEntity.status(ex.getStatusCode()).body(problemDetail);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ProblemDetail> handleDataIntegrityViolation(
            DataIntegrityViolationException ex, WebRequest request) {
        
        log.warn("Data integrity violation: {}", ex.getMessage());
        
        HttpStatus status = HttpStatus.CONFLICT;
        String detail = "Resource already exists or constraint violation";
        
        // Check if it's a duplicate webhook/payment
        if (ex.getMessage() != null) {
            if (ex.getMessage().contains("webhook_events")) {
                detail = "Webhook already processed";
            } else if (ex.getMessage().contains("payments")) {
                detail = "Payment already exists";
            }
        }
        
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(status, detail);
        problemDetail.setType(URI.create("https://aquastream.org/problems/payment.duplicate"));
        problemDetail.setTitle("Duplicate Resource");
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("path", request.getDescription(false));
        
        return ResponseEntity.status(status).body(problemDetail);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidationExceptions(
            MethodArgumentNotValidException ex, WebRequest request) {
        
        log.warn("Validation error: {}", ex.getMessage());
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, "Validation failed");
        problemDetail.setType(URI.create("https://aquastream.org/problems/payment.validation"));
        problemDetail.setTitle("Validation Error");
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("path", request.getDescription(false));
        problemDetail.setProperty("errors", errors);
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problemDetail);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ProblemDetail> handleIllegalArgument(
            IllegalArgumentException ex, WebRequest request) {
        
        log.warn("Invalid argument: {}", ex.getMessage());
        
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, ex.getMessage());
        problemDetail.setType(URI.create("https://aquastream.org/problems/payment.invalid-argument"));
        problemDetail.setTitle("Invalid Argument");
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

    private String getStatusTitle(int statusCode) {
        return switch (statusCode) {
            case 400 -> "Bad Request";
            case 401 -> "Unauthorized";
            case 403 -> "Forbidden";
            case 404 -> "Not Found";
            case 409 -> "Conflict";
            case 422 -> "Unprocessable Entity";
            case 500 -> "Internal Server Error";
            case 503 -> "Service Unavailable";
            default -> "Error";
        };
    }
}