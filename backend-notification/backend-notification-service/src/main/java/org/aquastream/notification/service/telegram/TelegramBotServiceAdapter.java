package org.aquastream.notification.service.telegram;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.common.mock.service.MockDetector;
import org.aquastream.common.mock.service.MockResponseGenerator;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Adapter for TelegramBotService with mock support
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TelegramBotServiceAdapter {

    private final TelegramBotService realTelegramBotService;
    private final MockDetector mockDetector;
    private final MockResponseGenerator mockResponseGenerator;

    /**
     * Send message with automatic mock detection
     */
    public boolean sendMessage(Long chatId, String text) {
        if (mockDetector.shouldUseMock("telegram")) {
            return sendMockMessage(chatId, text);
        }
        
        return realTelegramBotService.sendMessage(chatId, text);
    }

    /**
     * Set webhook with automatic mock detection
     */
    public boolean setWebhook() {
        if (mockDetector.shouldUseMock("telegram")) {
            return setMockWebhook();
        }
        
        return realTelegramBotService.setWebhook();
    }

    /**
     * Delete webhook with automatic mock detection
     */
    public boolean deleteWebhook() {
        if (mockDetector.shouldUseMock("telegram")) {
            return deleteMockWebhook();
        }
        
        return realTelegramBotService.deleteWebhook();
    }

    /**
     * Get bot info with automatic mock detection
     */
    public Map<String, Object> getBotInfo() {
        if (mockDetector.shouldUseMock("telegram")) {
            return getMockBotInfo();
        }
        
        return realTelegramBotService.getBotInfo();
    }

    private boolean sendMockMessage(Long chatId, String text) {
        log.info("Sending mock Telegram message to chat {}: {}", chatId, text);
        
        try {
            Map<String, Object> response = mockResponseGenerator.generateTelegramResponse(chatId, text);
            log.debug("Mock Telegram response: {}", response);
            
            // Simulate occasional failures in dev mode for testing
            if (Math.random() < 0.05) { // 5% failure rate
                log.warn("Mock Telegram message failed (simulated)");
                return false;
            }
            
            return true;
            
        } catch (Exception e) {
            log.error("Error in mock Telegram message", e);
            return false;
        }
    }

    private boolean setMockWebhook() {
        log.info("Setting mock Telegram webhook");
        mockResponseGenerator.addMockDelay();
        return true;
    }

    private boolean deleteMockWebhook() {
        log.info("Deleting mock Telegram webhook");
        mockResponseGenerator.addMockDelay();
        return true;
    }

    private Map<String, Object> getMockBotInfo() {
        log.debug("Getting mock Telegram bot info");
        
        mockResponseGenerator.addMockDelay();
        
        return Map.of(
            "id", 123456789L,
            "is_bot", true,
            "first_name", "Mock AquaStream Bot",
            "username", "mock_aquastream_bot",
            "can_join_groups", true,
            "can_read_all_group_messages", false,
            "supports_inline_queries", false,
            "mock", true
        );
    }
}