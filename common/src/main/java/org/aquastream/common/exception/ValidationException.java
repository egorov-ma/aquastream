package org.aquastream.common.exception;

import java.util.List;
import java.util.Map;

/**
 * Исключение для ошибок валидации
 */
public class ValidationException extends BusinessException {
    
    private final Map<String, List<String>> fieldErrors;
    
    public ValidationException(String message) {
        super(message, "VALIDATION_ERROR");
        this.fieldErrors = null;
    }
    
    public ValidationException(String message, Map<String, List<String>> fieldErrors) {
        super(message, "VALIDATION_ERROR");
        this.fieldErrors = fieldErrors;
    }
    
    public Map<String, List<String>> getFieldErrors() {
        return fieldErrors;
    }
    
    public boolean hasFieldErrors() {
        return fieldErrors != null && !fieldErrors.isEmpty();
    }
}