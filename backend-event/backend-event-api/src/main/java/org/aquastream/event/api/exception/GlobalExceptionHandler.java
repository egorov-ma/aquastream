package org.aquastream.event.api.exception;

import org.aquastream.event.exception.EventConflictException;
import org.aquastream.event.exception.EventNotFoundException;
import org.aquastream.event.exception.OrganizerNotFoundException;
import org.aquastream.event.exception.UnauthorizedEventAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.validation.ConstraintViolationException;
import java.net.URI;
import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EventNotFoundException.class)
    public ResponseEntity<ProblemDetail> handleEventNotFound(EventNotFoundException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.NOT_FOUND, ex.getMessage());
        problemDetail.setType(URI.create("https://aquastream.org/problems/event-not-found"));
        problemDetail.setTitle("Event Not Found");
        problemDetail.setProperty("timestamp", Instant.now());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problemDetail);
    }

    @ExceptionHandler(OrganizerNotFoundException.class)
    public ResponseEntity<ProblemDetail> handleOrganizerNotFound(OrganizerNotFoundException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.NOT_FOUND, ex.getMessage());
        problemDetail.setType(URI.create("https://aquastream.org/problems/organizer-not-found"));
        problemDetail.setTitle("Organizer Not Found");
        problemDetail.setProperty("timestamp", Instant.now());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problemDetail);
    }

    @ExceptionHandler(UnauthorizedEventAccessException.class)
    public ResponseEntity<ProblemDetail> handleUnauthorizedAccess(UnauthorizedEventAccessException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.FORBIDDEN, ex.getMessage());
        problemDetail.setType(URI.create("https://aquastream.org/problems/unauthorized-event-access"));
        problemDetail.setTitle("Unauthorized Event Access");
        problemDetail.setProperty("timestamp", Instant.now());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(problemDetail);
    }

    @ExceptionHandler(EventConflictException.class)
    public ResponseEntity<ProblemDetail> handleEventConflict(EventConflictException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.CONFLICT, ex.getMessage());
        problemDetail.setType(URI.create("https://aquastream.org/problems/event-conflict"));
        problemDetail.setTitle("Event Status Conflict");
        problemDetail.setProperty("timestamp", Instant.now());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(problemDetail);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidation(MethodArgumentNotValidException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, "Validation failed");
        problemDetail.setType(URI.create("https://aquastream.org/problems/validation-error"));
        problemDetail.setTitle("Validation Error");
        problemDetail.setProperty("timestamp", Instant.now());
        
        // Добавляем детали валидации
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            problemDetail.setProperty(error.getField(), error.getDefaultMessage()));
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problemDetail);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ProblemDetail> handleConstraintViolation(ConstraintViolationException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, "Constraint violation");
        problemDetail.setType(URI.create("https://aquastream.org/problems/constraint-violation"));
        problemDetail.setTitle("Constraint Violation");
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("violations", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problemDetail);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ProblemDetail> handleIllegalArgument(IllegalArgumentException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, ex.getMessage());
        problemDetail.setType(URI.create("https://aquastream.org/problems/invalid-argument"));
        problemDetail.setTitle("Invalid Argument");
        problemDetail.setProperty("timestamp", Instant.now());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problemDetail);
    }
}