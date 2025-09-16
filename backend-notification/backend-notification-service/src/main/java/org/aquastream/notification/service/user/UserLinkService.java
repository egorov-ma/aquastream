package org.aquastream.notification.service.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.notification.db.entity.TelegramSubscriptionEntity;
import org.aquastream.notification.db.repository.TelegramSubscriptionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserLinkService {

    private final TelegramSubscriptionRepository telegramSubscriptionRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.user-service.base-url}")
    private String userServiceBaseUrl;

    @Value("${app.user-service.timeout:5s}")
    private String userServiceTimeout;

    /**
     * Confirm Telegram account linking using verification code
     * This method calls the user service to validate the code and creates/updates telegram subscription
     */
    public boolean confirmTelegramLink(String linkCode, Long chatId, Long telegramUserId, String username) {
        if (linkCode == null || linkCode.trim().isEmpty()) {
            log.warn("Empty link code provided");
            return false;
        }

        if (chatId == null || telegramUserId == null) {
            log.warn("Invalid Telegram IDs provided: chatId={}, userId={}", chatId, telegramUserId);
            return false;
        }

        try {
            // Call user service to confirm the link and get user ID
            String userServiceUrl = userServiceBaseUrl + "/api/v1/telegram/link/confirm";
            
            Map<String, Object> requestBody = Map.of(
                "code", linkCode.trim(),
                "telegramChatId", chatId,
                "telegramUserId", telegramUserId,
                "telegramUsername", username != null ? username : ""
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            log.info("Calling user service to confirm link: code={}, chatId={}, userId={}", 
                     linkCode, chatId, telegramUserId);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(userServiceUrl, request, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                
                // Extract user ID from response
                Object userIdObj = responseBody.get("userId");
                if (userIdObj == null) {
                    log.error("User service response missing userId: {}", responseBody);
                    return false;
                }

                // Parse user ID (could be string or number)
                String userIdStr = userIdObj.toString();
                
                // Create or update telegram subscription
                return createOrUpdateTelegramSubscription(userIdStr, chatId, telegramUserId, username);
                
            } else {
                log.warn("User service returned error: HTTP {}", response.getStatusCode());
                return false;
            }
            
        } catch (RestClientException e) {
            log.error("Error calling user service for link confirmation", e);
            return false;
        } catch (Exception e) {
            log.error("Unexpected error during link confirmation", e);
            return false;
        }
    }

    /**
     * Create or update Telegram subscription for user
     */
    private boolean createOrUpdateTelegramSubscription(String userIdStr, Long chatId, Long telegramUserId, String username) {
        try {
            // Parse user ID as UUID (assuming UUID format)
            java.util.UUID userId = java.util.UUID.fromString(userIdStr);
            
            // Check if subscription already exists for this user
            Optional<TelegramSubscriptionEntity> existingOpt = telegramSubscriptionRepository.findByUserId(userId);
            
            TelegramSubscriptionEntity subscription;
            
            if (existingOpt.isPresent()) {
                // Update existing subscription
                subscription = existingOpt.get();
                log.info("Updating existing Telegram subscription for user {}", userId);
                
                subscription.setTelegramChatId(chatId);
                subscription.setTelegramUserId(telegramUserId);
                subscription.setTelegramUsername(username);
                subscription.markAsVerified();
                
            } else {
                // Create new subscription
                log.info("Creating new Telegram subscription for user {}", userId);
                
                subscription = TelegramSubscriptionEntity.builder()
                        .userId(userId)
                        .telegramChatId(chatId)
                        .telegramUserId(telegramUserId)
                        .telegramUsername(username)
                        .isActive(true)
                        .build();
                
                subscription.markAsVerified();
            }
            
            telegramSubscriptionRepository.save(subscription);
            log.info("Telegram subscription saved successfully for user {}", userId);
            
            return true;
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid user ID format: {}", userIdStr, e);
            return false;
        } catch (Exception e) {
            log.error("Error creating/updating Telegram subscription", e);
            return false;
        }
    }

    /**
     * Check if Telegram account is linked for given chat/user
     */
    public boolean isTelegramLinked(Long chatId, Long telegramUserId) {
        try {
            // Check by chat ID first
            Optional<TelegramSubscriptionEntity> byChatId = 
                    telegramSubscriptionRepository.findByTelegramChatId(chatId);
            
            if (byChatId.isPresent()) {
                TelegramSubscriptionEntity subscription = byChatId.get();
                return subscription.canReceiveMessages() && 
                       subscription.getTelegramUserId().equals(telegramUserId);
            }
            
            // Check by Telegram user ID
            Optional<TelegramSubscriptionEntity> byUserId = 
                    telegramSubscriptionRepository.findByTelegramUserId(telegramUserId);
            
            if (byUserId.isPresent()) {
                TelegramSubscriptionEntity subscription = byUserId.get();
                return subscription.canReceiveMessages() && 
                       subscription.getTelegramChatId().equals(chatId);
            }
            
            return false;
            
        } catch (Exception e) {
            log.error("Error checking Telegram link status for chatId={}, userId={}", chatId, telegramUserId, e);
            return false;
        }
    }

    /**
     * Deactivate Telegram subscription
     */
    public boolean deactivateTelegramSubscription(Long chatId, Long telegramUserId) {
        try {
            // Find subscription by chat ID or Telegram user ID
            Optional<TelegramSubscriptionEntity> subscriptionOpt = 
                    telegramSubscriptionRepository.findByTelegramChatId(chatId);
            
            if (subscriptionOpt.isEmpty()) {
                subscriptionOpt = telegramSubscriptionRepository.findByTelegramUserId(telegramUserId);
            }
            
            if (subscriptionOpt.isPresent()) {
                TelegramSubscriptionEntity subscription = subscriptionOpt.get();
                
                // Verify it's the same user
                if (!subscription.getTelegramChatId().equals(chatId) || 
                    !subscription.getTelegramUserId().equals(telegramUserId)) {
                    log.warn("Mismatch in Telegram IDs during deactivation attempt");
                    return false;
                }
                
                subscription.deactivate();
                telegramSubscriptionRepository.save(subscription);
                
                log.info("Deactivated Telegram subscription for chatId={}, userId={}", chatId, telegramUserId);
                return true;
                
            } else {
                log.warn("No Telegram subscription found for chatId={}, userId={}", chatId, telegramUserId);
                return false;
            }
            
        } catch (Exception e) {
            log.error("Error deactivating Telegram subscription for chatId={}, userId={}", chatId, telegramUserId, e);
            return false;
        }
    }

    /**
     * Get user ID by Telegram chat ID (for notification sending)
     */
    public Optional<java.util.UUID> getUserIdByChatId(Long chatId) {
        try {
            return telegramSubscriptionRepository.findByTelegramChatId(chatId)
                    .filter(TelegramSubscriptionEntity::canReceiveMessages)
                    .map(TelegramSubscriptionEntity::getUserId);
                    
        } catch (Exception e) {
            log.error("Error getting user ID for chatId={}", chatId, e);
            return Optional.empty();
        }
    }

    /**
     * Get chat ID by user ID (for notification sending)
     */
    public Optional<Long> getChatIdByUserId(java.util.UUID userId) {
        try {
            return telegramSubscriptionRepository.getChatIdByUserId(userId);
                    
        } catch (Exception e) {
            log.error("Error getting chat ID for userId={}", userId, e);
            return Optional.empty();
        }
    }
}