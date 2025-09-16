package org.aquastream.notification.service.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.notification.db.entity.TelegramSubscriptionEntity;
import org.aquastream.notification.db.repository.TelegramSubscriptionRepository;
import org.aquastream.notification.service.notification.dto.NotificationRequest;
import org.aquastream.notification.service.telegram.TelegramBotService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelegramNotificationSender {

    private final TelegramSubscriptionRepository telegramSubscriptionRepository;
    private final TelegramBotService telegramBotService;
    private final TelegramThrottlingService throttlingService;

    /**
     * Send notification via Telegram
     */
    public boolean sendTelegramNotification(NotificationRequest request, UUID notificationId) {
        log.debug("Sending Telegram notification for user {} with ID {}", 
                request.getUserId(), notificationId);
        
        try {
            // Get user's Telegram subscriptions
            List<TelegramSubscriptionEntity> subscriptions = 
                    telegramSubscriptionRepository.findByUserIdAndVerified(request.getUserId());
            
            if (subscriptions.isEmpty()) {
                log.debug("No verified Telegram subscriptions found for user {}", request.getUserId());
                return false;
            }
            
            boolean anySuccess = false;
            
            // Send to all verified Telegram accounts
            for (TelegramSubscriptionEntity subscription : subscriptions) {
                try {
                    // Check throttling before sending
                    if (!throttlingService.canSendMessage(subscription.getTelegramChatId())) {
                        log.warn("Telegram message throttled for chat {}", subscription.getTelegramChatId());
                        continue;
                    }
                    
                    // Format message for Telegram
                    String telegramMessage = formatTelegramMessage(request);
                    
                    // Send message
                    boolean sent = telegramBotService.sendMessage(subscription.getTelegramChatId(), telegramMessage);
                    
                    if (sent) {
                        anySuccess = true;
                        throttlingService.recordMessageSent(subscription.getTelegramChatId());
                        log.debug("Successfully sent Telegram notification to chat {} for user {}", 
                                subscription.getTelegramChatId(), request.getUserId());
                    } else {
                        log.warn("Failed to send Telegram notification to chat {} for user {}", 
                                subscription.getTelegramChatId(), request.getUserId());
                    }
                    
                } catch (Exception e) {
                    log.error("Error sending Telegram notification to chat {} for user {}: {}", 
                            subscription.getTelegramChatId(), request.getUserId(), e.getMessage(), e);
                }
            }
            
            return anySuccess;
            
        } catch (Exception e) {
            log.error("Error processing Telegram notification for user {}: {}", 
                    request.getUserId(), e.getMessage(), e);
            return false;
        }
    }

    private String formatTelegramMessage(NotificationRequest request) {
        StringBuilder message = new StringBuilder();
        
        // Add emoji based on category
        String emoji = getCategoryEmoji(request.getCategory());
        if (emoji != null) {
            message.append(emoji).append(" ");
        }
        
        // Add title
        message.append("*").append(escapeMarkdown(request.getTitle())).append("*\n\n");
        
        // Add main message
        message.append(escapeMarkdown(request.getMessage()));
        
        // Add metadata if present
        if (request.getMetadata() != null && !request.getMetadata().isEmpty()) {
            message.append("\n\n");
            
            // Add specific metadata fields that are useful for users
            if (request.getMetadata().containsKey("eventId")) {
                message.append("🎫 Event ID: ").append(request.getMetadata().get("eventId")).append("\n");
            }
            
            if (request.getMetadata().containsKey("bookingId")) {
                message.append("📋 Booking ID: ").append(request.getMetadata().get("bookingId")).append("\n");
            }
            
            if (request.getMetadata().containsKey("amount")) {
                message.append("💰 Amount: ").append(request.getMetadata().get("amount")).append("\n");
            }
            
            if (request.getMetadata().containsKey("eventDate")) {
                message.append("📅 Date: ").append(request.getMetadata().get("eventDate")).append("\n");
            }
        }
        
        // Add urgent indicator
        if (Boolean.TRUE.equals(request.getUrgent())) {
            message.append("\n\n⚠️ *Urgent*");
        }
        
        return message.toString();
    }

    private String getCategoryEmoji(org.aquastream.notification.db.entity.NotificationPrefsEntity.NotificationCategory category) {
        switch (category) {
            case BOOKING_CONFIRMED:
                return "✅";
            case PAYMENT_STATUS:
                return "💳";
            case EVENT_REMINDER:
                return "⏰";
            case WAITLIST_AVAILABLE:
                return "🎟️";
            case EVENT_NEWS:
                return "📢";
            default:
                return "ℹ️";
        }
    }

    private String escapeMarkdown(String text) {
        if (text == null) {
            return "";
        }
        
        // Escape special Telegram Markdown characters
        return text.replace("*", "\\*")
                  .replace("_", "\\_")
                  .replace("`", "\\`")
                  .replace("[", "\\[")
                  .replace("]", "\\]")
                  .replace("(", "\\(")
                  .replace(")", "\\)")
                  .replace("~", "\\~")
                  .replace(">", "\\>")
                  .replace("#", "\\#")
                  .replace("+", "\\+")
                  .replace("-", "\\-")
                  .replace("=", "\\=")
                  .replace("|", "\\|")
                  .replace("{", "\\{")
                  .replace("}", "\\}")
                  .replace(".", "\\.")
                  .replace("!", "\\!");
    }
}