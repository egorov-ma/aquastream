package org.aquastream.notification.service.notification;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.notification.service.notification.dto.NotificationRequest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisNotificationPublisher {

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    // Redis channel patterns
    private static final String NOTIFICATION_CHANNEL_PREFIX = "notify:";
    private static final String GLOBAL_CHANNEL = "notify:all";

    /**
     * Publish notification event to Redis for other services to consume
     */
    public void publishNotification(NotificationRequest request, UUID notificationId, List<String> sentChannels) {
        try {
            // Create notification event
            NotificationEvent event = createNotificationEvent(request, notificationId, sentChannels);
            String eventJson = objectMapper.writeValueAsString(event);
            
            // Publish to global channel
            publishToChannel(GLOBAL_CHANNEL, eventJson);
            
            // Publish to category-specific channel
            String categoryChannel = NOTIFICATION_CHANNEL_PREFIX + request.getCategory().name().toLowerCase();
            publishToChannel(categoryChannel, eventJson);
            
            // Publish to user-specific channel
            String userChannel = NOTIFICATION_CHANNEL_PREFIX + "user:" + request.getUserId();
            publishToChannel(userChannel, eventJson);
            
            log.debug("Published notification event {} to Redis channels", notificationId);
            
        } catch (Exception e) {
            log.error("Error publishing notification event to Redis: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to publish notification event", e);
        }
    }

    /**
     * Publish delivery status update
     */
    public void publishDeliveryStatus(UUID notificationId, String channel, boolean success, String error) {
        try {
            DeliveryStatusEvent event = DeliveryStatusEvent.builder()
                    .notificationId(notificationId)
                    .channel(channel)
                    .success(success)
                    .error(error)
                    .timestamp(Instant.now())
                    .build();
            
            String eventJson = objectMapper.writeValueAsString(event);
            String statusChannel = NOTIFICATION_CHANNEL_PREFIX + "status";
            
            publishToChannel(statusChannel, eventJson);
            
            log.debug("Published delivery status for notification {} channel {}: {}", 
                    notificationId, channel, success ? "success" : "failed");
            
        } catch (Exception e) {
            log.error("Error publishing delivery status to Redis: {}", e.getMessage(), e);
        }
    }

    /**
     * Publish user preferences change event
     */
    public void publishPreferencesChanged(UUID userId, String category, String channel, boolean enabled) {
        try {
            PreferencesChangedEvent event = PreferencesChangedEvent.builder()
                    .userId(userId)
                    .category(category)
                    .channel(channel)
                    .enabled(enabled)
                    .timestamp(Instant.now())
                    .build();
            
            String eventJson = objectMapper.writeValueAsString(event);
            String prefsChannel = NOTIFICATION_CHANNEL_PREFIX + "prefs";
            
            publishToChannel(prefsChannel, eventJson);
            
            log.debug("Published preferences change for user {}: {} {} {}", 
                    userId, category, channel, enabled);
            
        } catch (Exception e) {
            log.error("Error publishing preferences change to Redis: {}", e.getMessage(), e);
        }
    }

    private void publishToChannel(String channel, String message) {
        try {
            redisTemplate.convertAndSend(channel, message);
            log.trace("Published message to Redis channel: {}", channel);
        } catch (Exception e) {
            log.error("Error publishing to Redis channel {}: {}", channel, e.getMessage(), e);
            throw e;
        }
    }

    private NotificationEvent createNotificationEvent(NotificationRequest request, UUID notificationId, List<String> sentChannels) {
        return NotificationEvent.builder()
                .notificationId(notificationId)
                .userId(request.getUserId())
                .category(request.getCategory().name())
                .title(request.getTitle())
                .message(request.getMessage())
                .sentChannels(sentChannels)
                .urgent(request.getUrgent())
                .metadata(request.getMetadata())
                .timestamp(Instant.now())
                .build();
    }

    // Event DTOs for Redis publishing
    
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class NotificationEvent {
        private UUID notificationId;
        private UUID userId;
        private String category;
        private String title;
        private String message;
        private List<String> sentChannels;
        private Boolean urgent;
        private Map<String, Object> metadata;
        private Instant timestamp;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class DeliveryStatusEvent {
        private UUID notificationId;
        private String channel;
        private boolean success;
        private String error;
        private Instant timestamp;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class PreferencesChangedEvent {
        private UUID userId;
        private String category;
        private String channel;
        private boolean enabled;
        private Instant timestamp;
    }
}