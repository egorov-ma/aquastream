package org.aquastream.common.utils;

import java.util.regex.Pattern;

/**
 * Утилиты для валидации данных
 */
public final class ValidationUtils {
    
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$"
    );
    
    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "^\\+?[1-9]\\d{1,14}$"
    );
    
    private static final Pattern USERNAME_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9_-]{3,20}$"
    );
    
    private static final Pattern TELEGRAM_USERNAME_PATTERN = Pattern.compile(
        "^@?[a-zA-Z0-9_]{5,32}$"
    );
    
    private ValidationUtils() {
        throw new IllegalStateException("Utility class");
    }
    
    /**
     * Проверяет, что строка не пустая и не null
     */
    public static boolean isNotEmpty(String str) {
        return str != null && !str.trim().isEmpty();
    }
    
    /**
     * Проверяет, что строка пустая или null
     */
    public static boolean isEmpty(String str) {
        return !isNotEmpty(str);
    }
    
    /**
     * Проверяет корректность email адреса
     */
    public static boolean isValidEmail(String email) {
        return isNotEmpty(email) && EMAIL_PATTERN.matcher(email).matches();
    }
    
    /**
     * Проверяет корректность номера телефона
     */
    public static boolean isValidPhone(String phone) {
        return isNotEmpty(phone) && PHONE_PATTERN.matcher(phone.replaceAll("\\s|-", "")).matches();
    }
    
    /**
     * Проверяет корректность имени пользователя
     */
    public static boolean isValidUsername(String username) {
        return isNotEmpty(username) && USERNAME_PATTERN.matcher(username).matches();
    }
    
    /**
     * Проверяет корректность Telegram username
     */
    public static boolean isValidTelegramUsername(String telegramUsername) {
        return isNotEmpty(telegramUsername) && TELEGRAM_USERNAME_PATTERN.matcher(telegramUsername).matches();
    }
    
    /**
     * Проверяет, что пароль соответствует требованиям безопасности
     */
    public static boolean isValidPassword(String password) {
        if (isEmpty(password)) {
            return false;
        }
        
        return password.length() >= 6 && 
               password.length() <= 40 &&
               containsLetter(password) &&
               containsDigit(password);
    }
    
    /**
     * Проверяет минимальную длину строки
     */
    public static boolean hasMinLength(String str, int minLength) {
        return isNotEmpty(str) && str.trim().length() >= minLength;
    }
    
    /**
     * Проверяет максимальную длину строки
     */
    public static boolean hasMaxLength(String str, int maxLength) {
        return str == null || str.length() <= maxLength;
    }
    
    /**
     * Проверяет, что строка находится в заданном диапазоне длин
     */
    public static boolean isLengthInRange(String str, int minLength, int maxLength) {
        return hasMinLength(str, minLength) && hasMaxLength(str, maxLength);
    }
    
    /**
     * Проверяет, что строка содержит только буквы
     */
    public static boolean isAlphabetic(String str) {
        return isNotEmpty(str) && str.chars().allMatch(Character::isLetter);
    }
    
    /**
     * Проверяет, что строка содержит только цифры
     */
    public static boolean isNumeric(String str) {
        return isNotEmpty(str) && str.chars().allMatch(Character::isDigit);
    }
    
    /**
     * Проверяет, что строка содержит только буквы и цифры
     */
    public static boolean isAlphanumeric(String str) {
        return isNotEmpty(str) && str.chars().allMatch(Character::isLetterOrDigit);
    }
    
    /**
     * Проверяет наличие хотя бы одной буквы в строке
     */
    private static boolean containsLetter(String str) {
        return str.chars().anyMatch(Character::isLetter);
    }
    
    /**
     * Проверяет наличие хотя бы одной цифры в строке
     */
    private static boolean containsDigit(String str) {
        return str.chars().anyMatch(Character::isDigit);
    }
    
    /**
     * Очищает строку от лишних пробелов
     */
    public static String sanitize(String str) {
        return str == null ? null : str.trim();
    }
    
    /**
     * Нормализует телефонный номер (удаляет пробелы и дефисы)
     */
    public static String normalizePhone(String phone) {
        return phone == null ? null : phone.replaceAll("\\s|-", "");
    }
    
    /**
     * Нормализует Telegram username (добавляет @ если отсутствует)
     */
    public static String normalizeTelegramUsername(String telegramUsername) {
        if (isEmpty(telegramUsername)) {
            return telegramUsername;
        }
        
        String normalized = telegramUsername.trim();
        return normalized.startsWith("@") ? normalized : "@" + normalized;
    }
}