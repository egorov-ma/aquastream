package org.aquastream.event.exception;

/**
 * Exception thrown when a booking operation conflicts with business rules.
 * Results in HTTP 409 Conflict response.
 */
public class BookingConflictException extends RuntimeException {
    
    public BookingConflictException(String message) {
        super(message);
    }
    
    public BookingConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}