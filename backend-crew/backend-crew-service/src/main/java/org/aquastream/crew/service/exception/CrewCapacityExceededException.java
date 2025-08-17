package org.aquastream.crew.service.exception;

public class CrewCapacityExceededException extends RuntimeException {
    
    public CrewCapacityExceededException(String message) {
        super(message);
    }
    
    public CrewCapacityExceededException(String message, Throwable cause) {
        super(message, cause);
    }
}