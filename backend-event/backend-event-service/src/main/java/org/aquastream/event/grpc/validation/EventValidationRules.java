package org.aquastream.event.grpc.validation;

import org.springframework.stereotype.Component;

@Component
public class EventValidationRules {
    
    public static final int MAX_EVENT_NAME_LENGTH = 255;
    public static final int MIN_EVENT_NAME_LENGTH = 1;
    public static final int MAX_EVENT_DESCRIPTION_LENGTH = 1000;
    
    public void validateEventName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Event name is required and cannot be empty");
        }
        
        if (name.length() < MIN_EVENT_NAME_LENGTH) {
            throw new IllegalArgumentException(
                String.format("Event name must be at least %d character(s) long", MIN_EVENT_NAME_LENGTH));
        }
        
        if (name.length() > MAX_EVENT_NAME_LENGTH) {
            throw new IllegalArgumentException(
                String.format("Event name must not exceed %d characters", MAX_EVENT_NAME_LENGTH));
        }
        
        // Проверка на допустимые символы
        if (!name.matches("^[\\p{L}\\p{N}\\p{P}\\p{Z}]+$")) {
            throw new IllegalArgumentException("Event name contains invalid characters");
        }
    }
    
    public void validateEventDescription(String description) {
        if (description != null && description.length() > MAX_EVENT_DESCRIPTION_LENGTH) {
            throw new IllegalArgumentException(
                String.format("Event description must not exceed %d characters", MAX_EVENT_DESCRIPTION_LENGTH));
        }
    }
    
    public void validateEventRequest(String name, String description) {
        validateEventName(name);
        validateEventDescription(description);
    }
}