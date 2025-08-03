package org.aquastream.common.exception;

/**
 * Исключение для случаев конфликта данных
 */
public class ConflictException extends BusinessException {
    
    private final String conflictType;
    private final Object conflictValue;
    
    public ConflictException(String message) {
        super(message, "CONFLICT");
        this.conflictType = null;
        this.conflictValue = null;
    }
    
    public ConflictException(String message, String conflictType, Object conflictValue) {
        super(message, "CONFLICT");
        this.conflictType = conflictType;
        this.conflictValue = conflictValue;
    }
    
    public String getConflictType() {
        return conflictType;
    }
    
    public Object getConflictValue() {
        return conflictValue;
    }
}