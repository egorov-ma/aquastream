package org.aquastream.crew.api.exception;

import lombok.extern.slf4j.Slf4j;
import org.aquastream.crew.service.exception.*;
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

    @ExceptionHandler(CrewCapacityExceededException.class)
    public ResponseEntity<ProblemDetail> handleCrewCapacityExceeded(
            CrewCapacityExceededException ex, WebRequest request) {
        
        log.warn("Crew capacity exceeded: {}", ex.getMessage());
        
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage());
        problemDetail.setType(URI.create("https://aquastream.org/problems/crew.capacity-exceeded"));
        problemDetail.setTitle("Crew Capacity Exceeded");
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("path", request.getDescription(false));
        
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(problemDetail);
    }

    @ExceptionHandler({CrewNotFoundException.class, BoatNotFoundException.class, 
                       TentNotFoundException.class, AssignmentNotFoundException.class})
    public ResponseEntity<ProblemDetail> handleNotFound(
            RuntimeException ex, WebRequest request) {
        
        log.warn("Resource not found: {}", ex.getMessage());
        
        String type = "resource";
        if (ex instanceof CrewNotFoundException) type = "crew";
        else if (ex instanceof BoatNotFoundException) type = "boat";
        else if (ex instanceof TentNotFoundException) type = "tent";
        else if (ex instanceof AssignmentNotFoundException) type = "assignment";
        
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.NOT_FOUND, ex.getMessage());
        problemDetail.setType(URI.create("https://aquastream.org/problems/" + type + ".not-found"));
        problemDetail.setTitle(type.substring(0, 1).toUpperCase() + type.substring(1) + " Not Found");
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("path", request.getDescription(false));
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problemDetail);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ProblemDetail> handleIllegalArgument(
            IllegalArgumentException ex, WebRequest request) {
        
        log.warn("Invalid argument: {}", ex.getMessage());
        
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, ex.getMessage());
        problemDetail.setType(URI.create("https://aquastream.org/problems/invalid-argument"));
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
}
