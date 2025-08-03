package org.aquastream.common.exception;

/**
 * @deprecated Use specific exception types like BusinessException, ValidationException, etc.
 */
@Deprecated
public class CustomException extends BusinessException {
    public CustomException(String message) {
        super(message);
    }
    
    public CustomException(String message, Throwable cause) {
        super(message, cause);
    }
} 