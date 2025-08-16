package org.aquastream.event.exception;

public class EventConflictException extends RuntimeException {
    public EventConflictException(String message) {
        super(message);
    }
}