package org.aquastream.event.exception;

/**
 * Exception thrown when a user tries to access a booking they don't own.
 * Results in HTTP 403 Forbidden response.
 */
public class UnauthorizedBookingAccessException extends RuntimeException {
    
    public UnauthorizedBookingAccessException(String message) {
        super(message);
    }
    
    public UnauthorizedBookingAccessException(String message, Throwable cause) {
        super(message, cause);
    }
}