package org.aquastream.common.exception;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Утилиты для работы с исключениями
 */
public final class ExceptionUtils {
    
    private ExceptionUtils() {
        throw new IllegalStateException("Utility class");
    }
    
    /**
     * Создает ValidationException с одной ошибкой поля
     */
    public static ValidationException validationError(String field, String message) {
        Map<String, List<String>> fieldErrors = new HashMap<>();
        fieldErrors.put(field, Arrays.asList(message));
        return new ValidationException("Validation failed", fieldErrors);
    }
    
    /**
     * Создает ValidationException с несколькими ошибками полей
     */
    public static ValidationException validationError(Map<String, List<String>> fieldErrors) {
        return new ValidationException("Validation failed", fieldErrors);
    }
    
    /**
     * Создает ValidationException с общим сообщением
     */
    public static ValidationException validationError(String message) {
        return new ValidationException(message);
    }
    
    /**
     * Создает ResourceNotFoundException для пользователя
     */
    public static ResourceNotFoundException userNotFound(Object userId) {
        return new ResourceNotFoundException("User", userId);
    }
    
    /**
     * Создает ResourceNotFoundException для события
     */
    public static ResourceNotFoundException eventNotFound(Object eventId) {
        return new ResourceNotFoundException("Event", eventId);
    }
    
    /**
     * Создает ResourceNotFoundException с пользовательским сообщением
     */
    public static ResourceNotFoundException resourceNotFound(String message) {
        return new ResourceNotFoundException(message);
    }
    
    /**
     * Создает AccessDeniedException для доступа к ресурсу
     */
    public static AccessDeniedException accessDenied(String resource, String action) {
        return new AccessDeniedException(resource, action);
    }
    
    /**
     * Создает AccessDeniedException с пользовательским сообщением
     */
    public static AccessDeniedException accessDenied(String message) {
        return new AccessDeniedException(message);
    }
    
    /**
     * Создает ConflictException для дублирования email
     */
    public static ConflictException emailAlreadyExists(String email) {
        return new ConflictException(
            String.format("User with email '%s' already exists", email),
            "email",
            email
        );
    }
    
    /**
     * Создает ConflictException для дублирования username
     */
    public static ConflictException usernameAlreadyExists(String username) {
        return new ConflictException(
            String.format("User with username '%s' already exists", username),
            "username", 
            username
        );
    }
    
    /**
     * Создает ConflictException с пользовательским сообщением
     */
    public static ConflictException conflict(String message) {
        return new ConflictException(message);
    }
    
    /**
     * Создает BusinessException с пользовательским сообщением
     */
    public static BusinessException businessError(String message) {
        return new BusinessException(message);
    }
    
    /**
     * Создает BusinessException с кодом ошибки
     */
    public static BusinessException businessError(String message, String errorCode) {
        return new BusinessException(message, errorCode);
    }
    
    /**
     * Проверяет условие и бросает исключение, если оно false
     */
    public static void assertTrue(boolean condition, String message) {
        if (!condition) {
            throw businessError(message);
        }
    }
    
    /**
     * Проверяет, что объект не null, иначе бросает ResourceNotFoundException
     */
    public static <T> T requireNonNull(T object, String resourceType, Object resourceId) {
        if (object == null) {
            throw new ResourceNotFoundException(resourceType, resourceId);
        }
        return object;
    }
    
    /**
     * Проверяет, что объект не null, иначе бросает BusinessException
     */
    public static <T> T requireNonNull(T object, String message) {
        if (object == null) {
            throw businessError(message);
        }
        return object;
    }
}