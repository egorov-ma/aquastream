package org.aquastream.notification.service.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.notification.db.entity.NotificationPrefsEntity;
import org.aquastream.notification.service.notification.dto.NotificationRequest;
import org.aquastream.notification.service.notification.dto.NotificationResponse;
import org.aquastream.notification.service.prefs.NotificationPrefsService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationPrefsService notificationPrefsService;
    private final TelegramNotificationSender telegramSender;
    private final RedisNotificationPublisher redisPublisher;

    /**
     * Send notification to user based on their preferences
     */
    public NotificationResponse sendNotification(NotificationRequest request) {
        log.info("Processing notification request for user {} category {}", 
                request.getUserId(), request.getCategory());
        
        try {
            UUID notificationId = UUID.randomUUID();
            
            // Validate request
            validateRequest(request);
            
            // Determine channels to send to
            List<NotificationPrefsEntity.NotificationChannel> targetChannels = determineTargetChannels(request);
            
            if (targetChannels.isEmpty()) {
                log.info("No enabled channels found for user {} category {}", 
                        request.getUserId(), request.getCategory());
                return NotificationResponse.builder()
                        .success(true)
                        .message("No notifications sent - all channels disabled")
                        .notificationId(notificationId)
                        .skippedChannels(List.of("ALL"))
                        .processedAt(Instant.now())
                        .build();
            }
            
            // Send to each channel
            List<String> sentChannels = new ArrayList<>();
            List<String> failedChannels = new ArrayList<>();
            List<String> errors = new ArrayList<>();
            
            for (NotificationPrefsEntity.NotificationChannel channel : targetChannels) {
                try {
                    boolean sent = sendToChannel(request, channel, notificationId);
                    if (sent) {
                        sentChannels.add(channel.name());
                        log.debug("Successfully sent notification to {} for user {}", 
                                channel, request.getUserId());
                    } else {
                        failedChannels.add(channel.name());
                        log.warn("Failed to send notification to {} for user {}", 
                                channel, request.getUserId());
                    }
                } catch (Exception e) {
                    failedChannels.add(channel.name());
                    errors.add(String.format("%s: %s", channel, e.getMessage()));
                    log.error("Error sending notification to {} for user {}: {}", 
                            channel, request.getUserId(), e.getMessage(), e);
                }
            }
            
            // Publish to Redis for other services
            try {
                redisPublisher.publishNotification(request, notificationId, sentChannels);
            } catch (Exception e) {
                log.warn("Failed to publish notification to Redis: {}", e.getMessage());
                // Don't fail the whole operation if Redis publish fails
            }
            
            // Return response based on results
            if (!sentChannels.isEmpty() && failedChannels.isEmpty()) {
                return NotificationResponse.success(notificationId, sentChannels);
            } else if (!sentChannels.isEmpty()) {
                return NotificationResponse.partialSuccess(notificationId, sentChannels, failedChannels);
            } else {
                return NotificationResponse.failure("Failed to send to any channel", errors);
            }
            
        } catch (Exception e) {
            log.error("Error processing notification request: {}", e.getMessage(), e);
            return NotificationResponse.failure("Internal error: " + e.getMessage(), List.of(e.getMessage()));
        }
    }

    private void validateRequest(NotificationRequest request) {
        if (request.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required");
        }
        
        if (request.getCategory() == null) {
            throw new IllegalArgumentException("Category is required");
        }
        
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Title is required");
        }
        
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            throw new IllegalArgumentException("Message is required");
        }
        
        // Check if notification is expired
        if (request.getExpiresAt() != null && request.getExpiresAt() < Instant.now().getEpochSecond()) {
            throw new IllegalArgumentException("Notification has expired");
        }
        
        // Check if notification is scheduled for future
        if (request.getScheduledAt() != null && request.getScheduledAt() > Instant.now().getEpochSecond()) {
            throw new IllegalArgumentException("Scheduled notifications not supported yet");
        }
    }

    private List<NotificationPrefsEntity.NotificationChannel> determineTargetChannels(NotificationRequest request) {
        // If specific channel is requested, check if it's enabled
        if (request.getChannel() != null) {
            boolean enabled = notificationPrefsService.isNotificationEnabled(
                    request.getUserId(), request.getCategory(), request.getChannel());
            
            if (enabled || request.isRequired()) {
                return List.of(request.getChannel());
            } else {
                return List.of(); // Channel disabled and not required
            }
        }
        
        // Get all enabled channels for this category
        List<NotificationPrefsEntity.NotificationChannel> enabledChannels = 
                notificationPrefsService.getEnabledChannels(request.getUserId(), request.getCategory());
        
        // For required notifications, send to all channels even if disabled
        if (request.isRequired() && enabledChannels.isEmpty()) {
            log.warn("Required notification {} for user {} has no enabled channels, sending to all", 
                    request.getCategory(), request.getUserId());
            return List.of(NotificationPrefsEntity.NotificationChannel.values());
        }
        
        return enabledChannels;
    }

    private boolean sendToChannel(NotificationRequest request, 
                                NotificationPrefsEntity.NotificationChannel channel,
                                UUID notificationId) {
        
        switch (channel) {
            case TELEGRAM:
                return telegramSender.sendTelegramNotification(request, notificationId);
                
            case EMAIL:
                log.debug("EMAIL channel not implemented yet for notification {}", notificationId);
                return false;
                
            case SMS:
                log.debug("SMS channel not implemented yet for notification {}", notificationId);
                return false;
                
            case PUSH:
                log.debug("PUSH channel not implemented yet for notification {}", notificationId);
                return false;
                
            default:
                log.warn("Unknown notification channel: {}", channel);
                return false;
        }
    }
}