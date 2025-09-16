package org.aquastream.notification.api.controller.mock;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.common.mock.service.MockDetector;
import org.aquastream.common.mock.service.MockResponseGenerator;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Mock User Service controller for development
 */
@RestController
@RequestMapping("/mock/user")
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "app.mocks.enabled", havingValue = "true")
public class MockUserServiceController {

    private final MockDetector mockDetector;
    private final MockResponseGenerator responseGenerator;

    /**
     * Mock user verification endpoint
     */
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyUser(@RequestBody Map<String, Object> request) {
        
        if (!mockDetector.shouldUseMock("user-service")) {
            return ResponseEntity.notFound().build();
        }

        log.info("Mock user verification called with request: {}", request);

        String linkCode = (String) request.get("linkCode");
        Long chatId = getLong(request, "chatId");
        Long userId = getLong(request, "userId");
        String username = (String) request.get("username");

        Map<String, Object> response = responseGenerator.generateSuccessResponse("verifyUser");
        response.put("verified", true);
        response.put("userId", userId != null ? userId.toString() : UUID.randomUUID().toString());
        response.put("linkCode", linkCode);
        response.put("chatId", chatId);
        response.put("username", username);
        
        log.debug("Mock user verification response: {}", response);
        return ResponseEntity.ok(response);
    }

    /**
     * Mock get user by ID endpoint
     */
    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable String userId) {
        
        if (!mockDetector.shouldUseMock("user-service")) {
            return ResponseEntity.notFound().build();
        }

        log.info("Mock get user by ID called for userId: {}", userId);

        Map<String, Object> user = responseGenerator.generateMockUser(userId);
        
        log.debug("Mock user response: {}", user);
        return ResponseEntity.ok(user);
    }

    /**
     * Mock create Telegram link endpoint
     */
    @PostMapping("/{userId}/telegram/link")
    public ResponseEntity<Map<String, Object>> createTelegramLink(
            @PathVariable String userId,
            @RequestBody Map<String, Object> request) {
        
        if (!mockDetector.shouldUseMock("user-service")) {
            return ResponseEntity.notFound().build();
        }

        log.info("Mock create Telegram link called for userId: {}, request: {}", userId, request);

        Map<String, Object> response = responseGenerator.generateSuccessResponse("createTelegramLink");
        response.put("userId", userId);
        response.put("linkCode", "mock_" + UUID.randomUUID().toString().substring(0, 8));
        response.put("expiresAt", System.currentTimeMillis() + 300000); // 5 minutes
        response.put("deepLink", "https://t.me/mock_aquastream_bot?start=" + response.get("linkCode"));
        
        log.debug("Mock Telegram link response: {}", response);
        return ResponseEntity.ok(response);
    }

    /**
     * Mock confirm Telegram link endpoint
     */
    @PostMapping("/telegram/confirm")
    public ResponseEntity<Map<String, Object>> confirmTelegramLink(@RequestBody Map<String, Object> request) {
        
        if (!mockDetector.shouldUseMock("user-service")) {
            return ResponseEntity.notFound().build();
        }

        log.info("Mock confirm Telegram link called with request: {}", request);

        String linkCode = (String) request.get("linkCode");
        Long chatId = getLong(request, "chatId");
        Long telegramUserId = getLong(request, "telegramUserId");
        String username = (String) request.get("username");

        Map<String, Object> response = responseGenerator.generateSuccessResponse("confirmTelegramLink");
        response.put("confirmed", true);
        response.put("userId", UUID.randomUUID().toString());
        response.put("linkCode", linkCode);
        response.put("chatId", chatId);
        response.put("telegramUserId", telegramUserId);
        response.put("username", username);
        
        log.debug("Mock Telegram link confirmation response: {}", response);
        return ResponseEntity.ok(response);
    }

    /**
     * Mock health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = Map.of(
            "status", "UP",
            "service", "mock-user-service",
            "mockDetector", mockDetector.getMockStatus(),
            "mock", true
        );
        
        return ResponseEntity.ok(health);
    }

    /**
     * Mock status endpoint with detailed info
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> status = Map.of(
            "service", "mock-user-service",
            "status", "UP",
            "version", "mock-1.0.0",
            "endpoints", Map.of(
                "verify", "/mock/user/verify",
                "getUser", "/mock/user/{userId}",
                "createLink", "/mock/user/{userId}/telegram/link",
                "confirmLink", "/mock/user/telegram/confirm"
            ),
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