package org.aquastream.event.exception;

/**
 * Exception thrown when a booking is not found.
 * Results in HTTP 404 Not Found response.
 */
public class BookingNotFoundException extends RuntimeException {
    
    public BookingNotFoundException(String message) {
        super(message);
    }
    
    public BookingNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}