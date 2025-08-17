package org.aquastream.crew.api.service.exception;

public class TentNotFoundException extends RuntimeException {
    
    public TentNotFoundException(String message) {
        super(message);
    }
    
    public TentNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}