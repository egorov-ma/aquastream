package org.aquastream.notification.service.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.common.mock.service.MockDetector;
import org.aquastream.common.mock.service.MockResponseGenerator;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

/**
 * Adapter for UserLinkService with mock support
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserLinkServiceAdapter {

    private final UserLinkService realUserLinkService;
    private final MockDetector mockDetector;
    private final MockResponseGenerator mockResponseGenerator;

    /**
     * Confirm Telegram link with automatic mock detection
     */
    public boolean confirmTelegramLink(String linkCode, Long chatId, Long telegramUserId, String username) {
        if (mockDetector.shouldUseMock("user-service")) {
            return confirmMockTelegramLink(linkCode, chatId, telegramUserId, username);
        }
        
        return realUserLinkService.confirmTelegramLink(linkCode, chatId, telegramUserId, username);
    }

    /**
     * Create Telegram link with automatic mock detection
     */
    public String createTelegramLink(String userId) {
        if (mockDetector.shouldUseMock("user-service")) {
            return createMockTelegramLink(userId);
        }
        
        // For real implementation, this should be handled by the User service directly
        throw new UnsupportedOperationException("Link creation should be handled by User service");
    }

    /**
     * Check if Telegram is linked
     */
    public boolean isTelegramLinked(Long chatId, Long telegramUserId) {
        if (mockDetector.shouldUseMock("user-service")) {
            return true; // Mock always returns true
        }
        
        return realUserLinkService.isTelegramLinked(chatId, telegramUserId);
    }

    private boolean confirmMockTelegramLink(String linkCode, Long chatId, Long telegramUserId, String username) {
        log.info("Confirming mock Telegram link: linkCode={}, chatId={}, userId={}, username={}", 
                linkCode, chatId, telegramUserId, username);
        
        mockResponseGenerator.addMockDelay();
        
        // Simulate occasional failures
        if (Math.random() < 0.1) { // 10% failure rate for testing
            log.warn("Mock Telegram link confirmation failed (simulated)");
            return false;
        }
        
        return true;
    }

    private String createMockTelegramLink(String userId) {
        log.info("Creating mock Telegram link for user: {}", userId);
        
        mockResponseGenerator.addMockDelay();
        
        String linkCode = "mock_" + UUID.randomUUID().toString().substring(0, 8);
        log.debug("Generated mock link code: {}", linkCode);
        
        return linkCode;
    }

}