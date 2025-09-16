package org.aquastream.notification.api.controller.mock;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.common.mock.service.MockDetector;
import org.aquastream.common.mock.service.MockResponseGenerator;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Mock Telegram Bot API controller for development
 */
@RestController
@RequestMapping("/mock/telegram")
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "app.mocks.enabled", havingValue = "true")
public class MockTelegramController {

    private final MockDetector mockDetector;
    private final MockResponseGenerator responseGenerator;

    /**
     * Mock Telegram sendMessage API
     */
    @PostMapping("/bot{botToken}/sendMessage")
    public ResponseEntity<Map<String, Object>> sendMessage(
            @PathVariable String botToken,
            @RequestBody Map<String, Object> request) {
        
        if (!mockDetector.shouldUseMock("telegram")) {
            return ResponseEntity.notFound().build();
        }

        log.info("Mock Telegram sendMessage called with token: {}, request: {}", 
                botToken.substring(0, Math.min(10, botToken.length())) + "...", request);

        Long chatId = getLong(request, "chat_id");
        String text = (String) request.get("text");

        Map<String, Object> response = responseGenerator.generateTelegramResponse(chatId, text);
        
        log.debug("Mock Telegram response: {}", response);
        return ResponseEntity.ok(response);
    }

    /**
     * Mock Telegram setWebhook API
     */
    @PostMapping("/bot{botToken}/setWebhook")
    public ResponseEntity<Map<String, Object>> setWebhook(
            @PathVariable String botToken,
            @RequestBody Map<String, Object> request) {
        
        if (!mockDetector.shouldUseMock("telegram")) {
            return ResponseEntity.notFound().build();
        }

        log.info("Mock Telegram setWebhook called with token: {}, request: {}", 
                botToken.substring(0, Math.min(10, botToken.length())) + "...", request);

        Map<String, Object> response = responseGenerator.generateSuccessResponse("setWebhook");
        response.put("description", "Webhook was set successfully (mock)");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Mock Telegram deleteWebhook API
     */
    @PostMapping("/bot{botToken}/deleteWebhook")
    public ResponseEntity<Map<String, Object>> deleteWebhook(@PathVariable String botToken) {
        
        if (!mockDetector.shouldUseMock("telegram")) {
            return ResponseEntity.notFound().build();
        }

        log.info("Mock Telegram deleteWebhook called with token: {}", 
                botToken.substring(0, Math.min(10, botToken.length())) + "...");

        Map<String, Object> response = responseGenerator.generateSuccessResponse("deleteWebhook");
        response.put("description", "Webhook was deleted successfully (mock)");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Mock Telegram getMe API
     */
    @GetMapping("/bot{botToken}/getMe")
    public ResponseEntity<Map<String, Object>> getMe(@PathVariable String botToken) {
        
        if (!mockDetector.shouldUseMock("telegram")) {
            return ResponseEntity.notFound().build();
        }

        log.info("Mock Telegram getMe called with token: {}", 
                botToken.substring(0, Math.min(10, botToken.length())) + "...");

        Map<String, Object> bot = Map.of(
            "id", 123456789L,
            "is_bot", true,
            "first_name", "Mock Bot",
            "username", "mock_aquastream_bot",
            "can_join_groups", true,
            "can_read_all_group_messages", false,
            "supports_inline_queries", false
        );

        Map<String, Object> response = Map.of(
            "ok", true,
            "result", bot,
            "mock", true
        );
        
        return ResponseEntity.ok(response);
    }

    /**
     * Mock status endpoint
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> status = Map.of(
            "service", "mock-telegram",
            "status", "UP",
            "mockDetector", mockDetector.getMockStatus(),
            "mock", true
        );
        
        return ResponseEntity.ok(status);
    }

    private Long getLong(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        if (value instanceof String) {
            try {
                return Long.parseLong((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}