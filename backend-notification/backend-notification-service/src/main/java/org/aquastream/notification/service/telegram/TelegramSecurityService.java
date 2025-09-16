package org.aquastream.notification.service.telegram;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.notification.service.config.TelegramProperties;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelegramSecurityService {

    private final TelegramProperties telegramProperties;
    private final ObjectMapper objectMapper;

    /**
     * Verify Telegram webhook signature
     * @param updateData Raw update data
     * @param providedSignature Signature from X-Telegram-Bot-Api-Secret-Token header
     * @return true if signature is valid
     */
    public boolean verifyWebhookSignature(Map<String, Object> updateData, String providedSignature) {
        if (providedSignature == null || providedSignature.trim().isEmpty()) {
            log.warn("No signature provided for webhook verification");
            return false;
        }

        String expectedSecret = telegramProperties.getWebhookSecret();
        if (expectedSecret == null || expectedSecret.trim().isEmpty()) {
            log.debug("No webhook secret configured, skipping verification");
            return true;
        }

        try {
            // For Telegram webhooks, the signature is just the secret token
            // Not HMAC like other services - Telegram sends the secret directly
            boolean isValid = expectedSecret.equals(providedSignature.trim());
            
            if (!isValid) {
                log.warn("Webhook signature verification failed. Expected: {}, Got: {}", 
                         expectedSecret.substring(0, Math.min(8, expectedSecret.length())) + "***",
                         providedSignature.substring(0, Math.min(8, providedSignature.length())) + "***");
            }
            
            return isValid;
            
        } catch (Exception e) {
            log.error("Error verifying webhook signature", e);
            return false;
        }
    }

    /**
     * Generate HMAC-SHA256 signature for verification (alternative method)
     * @param data Data to sign
     * @param secret Secret key
     * @return Hex-encoded signature
     */
    public String generateHmacSha256(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            
            byte[] signature = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            
            // Convert to hex string
            StringBuilder hexString = new StringBuilder();
            for (byte b : signature) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            
            return hexString.toString();
            
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("Error generating HMAC-SHA256 signature", e);
            throw new RuntimeException("Failed to generate signature", e);
        }
    }

    /**
     * Validate chat ID to prevent unauthorized access
     * @param chatId Chat ID to validate
     * @return true if chat ID is valid
     */
    public boolean isValidChatId(Long chatId) {
        if (chatId == null) {
            return false;
        }
        
        // Basic validation - Telegram chat IDs are typically negative for groups,
        // positive for private chats, and have reasonable bounds
        return Math.abs(chatId) < 1_000_000_000_000L; // 1 trillion limit
    }

    /**
     * Sanitize user input to prevent injection attacks
     * @param input User input text
     * @return Sanitized text
     */
    public String sanitizeUserInput(String input) {
        if (input == null) {
            return null;
        }
        
        // Remove potentially dangerous characters and limit length
        return input.trim()
                    .replaceAll("[<>\"'&]", "") // Remove HTML/script chars
                    .substring(0, Math.min(input.length(), 4096)); // Telegram message limit
    }

    /**
     * Check if user is rate-limited
     * Basic rate limiting implementation
     * @param userId User ID
     * @return true if user should be rate-limited
     */
    public boolean isRateLimited(Long userId) {
        // TODO: Implement proper rate limiting with Redis
        // For now, just basic validation
        return userId == null || userId <= 0;
    }
}