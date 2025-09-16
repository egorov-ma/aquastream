package org.aquastream.notification.api.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.notification.service.telegram.TelegramBotService;
import org.aquastream.notification.service.telegram.TelegramWebhookService;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Development controller for testing Telegram bot functionality
 * Only available in dev/test profiles
 */
@RestController
@RequestMapping("/api/v1/dev/telegram")
@RequiredArgsConstructor
@Slf4j
@Profile({"dev", "test", "local"})
public class TelegramDevController {

    private final TelegramWebhookService telegramWebhookService;
    private final TelegramBotService telegramBotService;

    /**
     * Test webhook processing with mock data
     */
    @PostMapping("/test-webhook")
    public ResponseEntity<Map<String, Object>> testWebhook(@RequestBody Map<String, Object> mockUpdate) {
        log.info("Testing webhook with mock data: {}", mockUpdate);
        
        try {
            // Process mock update
            telegramWebhookService.processUpdate(mockUpdate, "dev-secret");
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Mock webhook processed",
                "processedUpdate", mockUpdate.keySet()
            ));
            
        } catch (Exception e) {
            log.error("Error processing mock webhook", e);
            return ResponseEntity.ok(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Test sending message to specific chat
     */
    @PostMapping("/test-message")
    public ResponseEntity<Map<String, Object>> testMessage(
            @RequestParam Long chatId,
            @RequestParam String message) {
        
        log.info("Testing message send to chat {}: {}", chatId, message);
        
        boolean success = telegramBotService.sendMessage(chatId, message);
        
        return ResponseEntity.ok(Map.of(
            "status", success ? "success" : "failed",
            "chatId", chatId,
            "message", message,
            "sent", success
        ));
    }

    /**
     * Mock /start command with deep-link
     */
    @PostMapping("/mock-start")
    public ResponseEntity<Map<String, Object>> mockStartCommand(
            @RequestParam Long chatId,
            @RequestParam Long userId,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String linkCode) {
        
        log.info("Mocking /start command: chatId={}, userId={}, code={}", chatId, userId, linkCode);
        
        // Create mock update for /start command
        Map<String, Object> mockMessage = Map.of(
            "message_id", 1,
            "from", Map.of(
                "id", userId,
                "username", username != null ? username : "testuser",
                "first_name", "Test",
                "is_bot", false
            ),
            "chat", Map.of(
                "id", chatId,
                "type", "private"
            ),
            "date", System.currentTimeMillis() / 1000,
            "text", linkCode != null ? "/start " + linkCode : "/start"
        );
        
        Map<String, Object> mockUpdate = Map.of(
            "update_id", System.currentTimeMillis(),
            "message", mockMessage
        );
        
        try {
            telegramWebhookService.processUpdate(mockUpdate, "dev-secret");
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Mock /start command processed",
                "update", mockUpdate
            ));
            
        } catch (Exception e) {
            log.error("Error processing mock /start command", e);
            return ResponseEntity.ok(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Get webhook info from Telegram API
     */
    @GetMapping("/webhook-info")
    public ResponseEntity<Map<String, Object>> getWebhookInfo() {
        Map<String, Object> info = telegramBotService.getWebhookInfo();
        return ResponseEntity.ok(info);
    }

    /**
     * Get bot info from Telegram API
     */
    @GetMapping("/bot-info")
    public ResponseEntity<Map<String, Object>> getBotInfo() {
        Map<String, Object> info = telegramBotService.getBotInfo();
        return ResponseEntity.ok(info);
    }

    /**
     * Set webhook URL
     */
    @PostMapping("/set-webhook")
    public ResponseEntity<Map<String, Object>> setWebhook() {
        boolean success = telegramBotService.setWebhook();
        
        return ResponseEntity.ok(Map.of(
            "status", success ? "success" : "failed",
            "message", success ? "Webhook set successfully" : "Failed to set webhook"
        ));
    }

    /**
     * Delete webhook (for testing)
     */
    @DeleteMapping("/webhook")
    public ResponseEntity<Map<String, Object>> deleteWebhook() {
        boolean success = telegramBotService.deleteWebhook();
        
        return ResponseEntity.ok(Map.of(
            "status", success ? "success" : "failed",
            "message", success ? "Webhook deleted successfully" : "Failed to delete webhook"
        ));
    }

    /**
     * Generate sample webhook payloads for testing
     */
    @GetMapping("/sample-payloads")
    public ResponseEntity<Map<String, Object>> getSamplePayloads() {
        Map<String, Object> startCommand = Map.of(
            "update_id", 123456789,
            "message", Map.of(
                "message_id", 1,
                "from", Map.of(
                    "id", 987654321L,
                    "is_bot", false,
                    "first_name", "Test",
                    "username", "testuser"
                ),
                "chat", Map.of(
                    "id", 987654321L,
                    "type", "private"
                ),
                "date", 1692276000,
                "text", "/start ABC123"
            )
        );

        Map<String, Object> helpCommand = Map.of(
            "update_id", 123456790,
            "message", Map.of(
                "message_id", 2,
                "from", Map.of(
                    "id", 987654321L,
                    "is_bot", false,
                    "first_name", "Test",
                    "username", "testuser"
                ),
                "chat", Map.of(
                    "id", 987654321L,
                    "type", "private"
                ),
                "date", 1692276001,
                "text", "/help"
            )
        );

        return ResponseEntity.ok(Map.of(
            "start_with_code", startCommand,
            "help_command", helpCommand,
            "description", "Sample webhook payloads for testing"
        ));
    }
}