package org.aquastream.notification.service.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelegramThrottlingService {

    private final RedisTemplate<String, String> redisTemplate;
    
    // Telegram Bot API limits: 30 messages per second to all chats, 1 message per second per chat
    private static final int MESSAGES_PER_SECOND_PER_CHAT = 1;
    private static final int GLOBAL_MESSAGES_PER_SECOND = 30;
    
    // Redis key prefixes
    private static final String CHAT_THROTTLE_KEY_PREFIX = "telegram:throttle:chat:";
    private static final String GLOBAL_THROTTLE_KEY = "telegram:throttle:global";
    
    /**
     * Check if we can send a message to specific chat
     */
    public boolean canSendMessage(Long chatId) {
        try {
            // Check per-chat throttling (1 message per second per chat)
            String chatKey = CHAT_THROTTLE_KEY_PREFIX + chatId;
            String lastSent = redisTemplate.opsForValue().get(chatKey);
            
            long now = Instant.now().getEpochSecond();
            
            if (lastSent != null) {
                long lastSentTime = Long.parseLong(lastSent);
                if (now - lastSentTime < MESSAGES_PER_SECOND_PER_CHAT) {
                    log.debug("Chat {} throttled: last message sent {} seconds ago", 
                            chatId, now - lastSentTime);
                    return false;
                }
            }
            
            // Check global throttling (30 messages per second total)
            String globalCount = redisTemplate.opsForValue().get(GLOBAL_THROTTLE_KEY);
            if (globalCount != null) {
                int currentCount = Integer.parseInt(globalCount);
                if (currentCount >= GLOBAL_MESSAGES_PER_SECOND) {
                    log.debug("Global Telegram throttling active: {} messages in current second", currentCount);
                    return false;
                }
            }
            
            return true;
            
        } catch (Exception e) {
            log.error("Error checking Telegram throttling for chat {}: {}", chatId, e.getMessage());
            // On error, allow sending (fail open)
            return true;
        }
    }

    /**
     * Record that a message was sent
     */
    public void recordMessageSent(Long chatId) {
        try {
            long now = Instant.now().getEpochSecond();
            
            // Record per-chat timestamp
            String chatKey = CHAT_THROTTLE_KEY_PREFIX + chatId;
            redisTemplate.opsForValue().set(chatKey, String.valueOf(now), Duration.ofSeconds(2));
            
            // Increment global counter for current second
            String globalKey = GLOBAL_THROTTLE_KEY;
            redisTemplate.opsForValue().increment(globalKey);
            redisTemplate.expire(globalKey, 1, TimeUnit.SECONDS);
            
            log.debug("Recorded Telegram message sent to chat {}", chatId);
            
        } catch (Exception e) {
            log.error("Error recording Telegram message sent for chat {}: {}", chatId, e.getMessage());
            // Don't fail on recording errors
        }
    }

    /**
     * Get current throttling status for monitoring
     */
    public ThrottlingStatus getThrottlingStatus() {
        try {
            String globalCount = redisTemplate.opsForValue().get(GLOBAL_THROTTLE_KEY);
            int currentGlobalCount = globalCount != null ? Integer.parseInt(globalCount) : 0;
            
            return ThrottlingStatus.builder()
                    .globalMessagesThisSecond(currentGlobalCount)
                    .globalLimit(GLOBAL_MESSAGES_PER_SECOND)
                    .perChatLimit(MESSAGES_PER_SECOND_PER_CHAT)
                    .globalThrottled(currentGlobalCount >= GLOBAL_MESSAGES_PER_SECOND)
                    .build();
            
        } catch (Exception e) {
            log.error("Error getting Telegram throttling status: {}", e.getMessage());
            return ThrottlingStatus.builder()
                    .globalMessagesThisSecond(0)
                    .globalLimit(GLOBAL_MESSAGES_PER_SECOND)
                    .perChatLimit(MESSAGES_PER_SECOND_PER_CHAT)
                    .globalThrottled(false)
                    .build();
        }
    }

    /**
     * Clear throttling data for specific chat (for testing/admin purposes)
     */
    public void clearChatThrottling(Long chatId) {
        try {
            String chatKey = CHAT_THROTTLE_KEY_PREFIX + chatId;
            redisTemplate.delete(chatKey);
            log.info("Cleared Telegram throttling for chat {}", chatId);
        } catch (Exception e) {
            log.error("Error clearing Telegram throttling for chat {}: {}", chatId, e.getMessage());
        }
    }

    /**
     * Clear global throttling (for testing/admin purposes)
     */
    public void clearGlobalThrottling() {
        try {
            redisTemplate.delete(GLOBAL_THROTTLE_KEY);
            log.info("Cleared global Telegram throttling");
        } catch (Exception e) {
            log.error("Error clearing global Telegram throttling: {}", e.getMessage());
        }
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ThrottlingStatus {
        private int globalMessagesThisSecond;
        private int globalLimit;
        private int perChatLimit;
        private boolean globalThrottled;
    }
}