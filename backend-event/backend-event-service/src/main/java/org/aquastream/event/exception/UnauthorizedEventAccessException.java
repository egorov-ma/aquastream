package org.aquastream.event.exception;

public class UnauthorizedEventAccessException extends RuntimeException {
    public UnauthorizedEventAccessException(String message) {
        super(message);
    }
}