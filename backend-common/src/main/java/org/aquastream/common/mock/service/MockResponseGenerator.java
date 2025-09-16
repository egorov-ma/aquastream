package org.aquastream.common.mock.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.common.mock.config.MockProperties;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Service for generating realistic mock responses
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MockResponseGenerator {

    private final MockProperties mockProperties;
    private final ObjectMapper objectMapper;

    /**
     * Add realistic delay to mock response
     */
    public void addMockDelay() {
        if (!mockProperties.getDelay().isEnabled()) {
            return;
        }

        try {
            long minMs = mockProperties.getDelay().getMinMs();
            long maxMs = mockProperties.getDelay().getMaxMs();
            long delay = ThreadLocalRandom.current().nextLong(minMs, maxMs + 1);
            
            Thread.sleep(delay);
            log.trace("Added mock delay: {}ms", delay);
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.debug("Mock delay interrupted");
        }
    }

    /**
     * Generate mock success response
     */
    public Map<String, Object> generateSuccessResponse(String operation) {
        addMockDelay();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("operation", operation);
        response.put("mockId", UUID.randomUUID().toString());
        response.put("timestamp", Instant.now().toString());
        response.put("mock", true);
        
        return response;
    }

    /**
     * Generate mock error response
     */
    public Map<String, Object> generateErrorResponse(String operation, String errorMessage) {
        addMockDelay();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("operation", operation);
        response.put("error", errorMessage);
        response.put("mockId", UUID.randomUUID().toString());
        response.put("timestamp", Instant.now().toString());
        response.put("mock", true);
        
        return response;
    }

    /**
     * Generate mock user data
     */
    public Map<String, Object> generateMockUser(String userId) {
        addMockDelay();
        
        Map<String, Object> user = new HashMap<>();
        user.put("id", userId != null ? userId : UUID.randomUUID().toString());
        user.put("username", "mockuser_" + generateRandomString(6));
        user.put("email", "mock." + generateRandomString(5) + "@example.com");
        user.put("firstName", generateRandomName());
        user.put("lastName", generateRandomName());
        user.put("active", true);
        user.put("createdAt", Instant.now().minusSeconds(ThreadLocalRandom.current().nextLong(86400, 31536000)));
        user.put("mock", true);
        
        return user;
    }

    /**
     * Generate mock Telegram message response
     */
    public Map<String, Object> generateTelegramResponse(Long chatId, String text) {
        addMockDelay();
        
        Map<String, Object> message = new HashMap<>();
        message.put("message_id", ThreadLocalRandom.current().nextLong(1000, 999999));
        message.put("chat", Map.of("id", chatId, "type", "private"));
        message.put("date", Instant.now().getEpochSecond());
        message.put("text", text);
        
        Map<String, Object> response = new HashMap<>();
        response.put("ok", true);
        response.put("result", message);
        response.put("mock", true);
        
        return response;
    }

    /**
     * Generate list of mock data
     */
    public <T> List<T> generateMockList(Class<T> type, int count) {
        List<T> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            if (type == Map.class) {
                @SuppressWarnings("unchecked")
                T item = (T) Map.of(
                    "id", UUID.randomUUID().toString(),
                    "name", "Mock Item " + (i + 1),
                    "mock", true
                );
                list.add(item);
            }
        }
        return list;
    }

    /**
     * Convert mock response to JSON
     */
    public String toJson(Object response) {
        try {
            return objectMapper.writeValueAsString(response);
        } catch (Exception e) {
            log.error("Error converting mock response to JSON", e);
            return "{\"error\":\"Mock serialization failed\",\"mock\":true}";
        }
    }

    private String generateRandomString(int length) {
        String chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(ThreadLocalRandom.current().nextInt(chars.length())));
        }
        return sb.toString();
    }

    private String generateRandomName() {
        String[] names = {"Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry"};
        return names[ThreadLocalRandom.current().nextInt(names.length)];
    }
}