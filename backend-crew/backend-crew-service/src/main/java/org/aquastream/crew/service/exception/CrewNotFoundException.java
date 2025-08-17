package org.aquastream.crew.service.exception;

public class CrewNotFoundException extends RuntimeException {
    
    public CrewNotFoundException(String message) {
        super(message);
    }
    
    public CrewNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}