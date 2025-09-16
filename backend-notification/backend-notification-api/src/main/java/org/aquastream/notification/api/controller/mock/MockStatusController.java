package org.aquastream.notification.api.controller.mock;

import lombok.RequiredArgsConstructor;
import org.aquastream.common.mock.service.MockDetector;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for monitoring mock status and configuration
 */
@RestController
@RequestMapping("/actuator/mocks")
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.mocks.enabled", havingValue = "true")
public class MockStatusController {

    private final MockDetector mockDetector;

    /**
     * Get overall mock status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getMockStatus() {
        Map<String, Object> status = new HashMap<>();
        
        MockDetector.MockStatus mockStatus = mockDetector.getMockStatus();
        status.put("mockDetector", mockStatus);
        
        // Check specific mock types
        status.put("mocks", Map.of(
            "telegram", mockDetector.shouldUseMock("telegram"),
            "user-service", mockDetector.shouldUseMock("user-service"),
            "general", mockDetector.shouldUseMocks()
        ));
        
        // Available mock endpoints
        status.put("endpoints", Map.of(
            "telegram", Map.of(
                "sendMessage", "/mock/telegram/bot{token}/sendMessage",
                "setWebhook", "/mock/telegram/bot{token}/setWebhook",
                "getMe", "/mock/telegram/bot{token}/getMe",
                "status", "/mock/telegram/status"
            ),
            "userService", Map.of(
                "verify", "/mock/user/verify",
                "getUser", "/mock/user/{userId}",
                "createLink", "/mock/user/{userId}/telegram/link",
                "confirmLink", "/mock/user/telegram/confirm",
                "health", "/mock/user/health"
            )
        ));
        
        status.put("service", "notification");
        status.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(status);
    }

    /**
     * Get mock configuration
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getMockConfig() {
        Map<String, Object> config = new HashMap<>();
        
        config.put("enabled", mockDetector.shouldUseMocks());
        config.put("profiles", mockDetector.getActiveProfiles());
        config.put("allowedProfile", mockDetector.isAllowedProfile());
        config.put("headerOverride", mockDetector.checkHeaderOverride());
        
        return ResponseEntity.ok(config);
    }

    /**
     * Test mock functionality
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testMocks() {
        Map<String, Object> result = new HashMap<>();
        
        result.put("mockStatus", mockDetector.getMockStatus());
        result.put("timestamp", System.currentTimeMillis());
        result.put("testMessage", "Mock system is operational");
        
        return ResponseEntity.ok(result);
    }
}