package org.aquastream.common.exception;

/**
 * Исключение для случаев отказа в доступе
 */
public class AccessDeniedException extends BusinessException {
    
    private final String resource;
    private final String action;
    
    public AccessDeniedException(String message) {
        super(message, "ACCESS_DENIED");
        this.resource = null;
        this.action = null;
    }
    
    public AccessDeniedException(String resource, String action) {
        super(String.format("Access denied to %s resource for action: %s", resource, action), "ACCESS_DENIED");
        this.resource = resource;
        this.action = action;
    }
    
    public AccessDeniedException(String message, String resource, String action) {
        super(message, "ACCESS_DENIED");
        this.resource = resource;
        this.action = action;
    }
    
    public String getResource() {
        return resource;
    }
    
    public String getAction() {
        return action;
    }
}