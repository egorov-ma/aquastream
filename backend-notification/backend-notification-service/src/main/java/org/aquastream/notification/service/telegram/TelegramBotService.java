package org.aquastream.notification.service.telegram;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.notification.service.config.TelegramProperties;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelegramBotService {

    private final TelegramProperties telegramProperties;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper;

    /**
     * Send text message to chat
     */
    public boolean sendMessage(Long chatId, String text) {
        return sendMessage(chatId, text, null);
    }

    /**
     * Send text message with reply markup
     */
    public boolean sendMessage(Long chatId, String text, Map<String, Object> replyMarkup) {
        if (!telegramProperties.isBotEnabled()) {
            log.info("Telegram bot disabled - would send message to {}: {}", chatId, text);
            return true; // Return true for dev mode
        }

        if (chatId == null || text == null || text.trim().isEmpty()) {
            log.warn("Invalid parameters for sending message: chatId={}, text={}", chatId, text);
            return false;
        }

        try {
            String url = telegramProperties.getApi().getBaseUrl() + telegramProperties.getBotToken() + "/sendMessage";
            
            Map<String, Object> requestBody = Map.of(
                "chat_id", chatId,
                "text", text.trim(),
                "parse_mode", "HTML",
                "disable_web_page_preview", true
            );

            // Add reply markup if provided
            if (replyMarkup != null && !replyMarkup.isEmpty()) {
                requestBody = Map.of(
                    "chat_id", chatId,
                    "text", text.trim(),
                    "parse_mode", "HTML",
                    "disable_web_page_preview", true,
                    "reply_markup", replyMarkup
                );
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                log.debug("Message sent successfully to chat {}", chatId);
                return true;
            } else {
                log.warn("Failed to send message to chat {}: HTTP {}", chatId, response.getStatusCode());
                return false;
            }
            
        } catch (RestClientException e) {
            log.error("Error sending message to chat {}", chatId, e);
            return false;
        } catch (Exception e) {
            log.error("Unexpected error sending message to chat {}", chatId, e);
            return false;
        }
    }

    /**
     * Send message asynchronously
     */
    public CompletableFuture<Boolean> sendMessageAsync(Long chatId, String text) {
        return CompletableFuture.supplyAsync(() -> sendMessage(chatId, text));
    }

    /**
     * Set webhook URL for the bot
     */
    public boolean setWebhook() {
        if (!telegramProperties.isBotEnabled()) {
            log.info("Telegram bot disabled - skipping webhook setup");
            return true;
        }

        String webhookUrl = telegramProperties.getWebhookUrl();
        if (webhookUrl == null || webhookUrl.trim().isEmpty()) {
            log.warn("No webhook URL configured");
            return false;
        }

        try {
            String url = telegramProperties.getApi().getBaseUrl() + telegramProperties.getBotToken() + "/setWebhook";
            
            Map<String, Object> requestBody = Map.of(
                "url", webhookUrl.trim(),
                "max_connections", 40,
                "drop_pending_updates", true
            );

            // Add secret token if configured
            String secret = telegramProperties.getWebhookSecret();
            if (secret != null && !secret.trim().isEmpty()) {
                requestBody = Map.of(
                    "url", webhookUrl.trim(),
                    "secret_token", secret.trim(),
                    "max_connections", 40,
                    "drop_pending_updates", true
                );
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Webhook set successfully: {}", webhookUrl);
                return true;
            } else {
                log.error("Failed to set webhook: HTTP {}", response.getStatusCode());
                return false;
            }
            
        } catch (Exception e) {
            log.error("Error setting webhook", e);
            return false;
        }
    }

    /**
     * Delete webhook (for development)
     */
    public boolean deleteWebhook() {
        if (!telegramProperties.isBotEnabled()) {
            log.info("Telegram bot disabled - skipping webhook deletion");
            return true;
        }

        try {
            String url = telegramProperties.getApi().getBaseUrl() + telegramProperties.getBotToken() + "/deleteWebhook";
            
            Map<String, Object> requestBody = Map.of("drop_pending_updates", true);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Webhook deleted successfully");
                return true;
            } else {
                log.error("Failed to delete webhook: HTTP {}", response.getStatusCode());
                return false;
            }
            
        } catch (Exception e) {
            log.error("Error deleting webhook", e);
            return false;
        }
    }

    /**
     * Get webhook info
     */
    public Map<String, Object> getWebhookInfo() {
        if (!telegramProperties.isBotEnabled()) {
            return Map.of("status", "disabled");
        }

        try {
            String url = telegramProperties.getApi().getBaseUrl() + telegramProperties.getBotToken() + "/getWebhookInfo";
            
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                return response.getBody();
            } else {
                return Map.of("error", "HTTP " + response.getStatusCode());
            }
            
        } catch (Exception e) {
            log.error("Error getting webhook info", e);
            return Map.of("error", e.getMessage());
        }
    }

    /**
     * Get bot info
     */
    public Map<String, Object> getBotInfo() {
        if (!telegramProperties.isBotEnabled()) {
            return Map.of("status", "disabled");
        }

        try {
            String url = telegramProperties.getApi().getBaseUrl() + telegramProperties.getBotToken() + "/getMe";
            
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                return response.getBody();
            } else {
                return Map.of("error", "HTTP " + response.getStatusCode());
            }
            
        } catch (Exception e) {
            log.error("Error getting bot info", e);
            return Map.of("error", e.getMessage());
        }
    }
}