package org.aquastream.notification.service.telegram;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.notification.service.config.TelegramProperties;
import org.aquastream.notification.service.telegram.dto.TelegramUpdate;
import org.aquastream.notification.service.telegram.handler.TelegramCommandHandler;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelegramWebhookService {

    private final TelegramProperties telegramProperties;
    private final TelegramCommandHandler commandHandler;
    private final TelegramSecurityService securityService;

    /**
     * Process incoming Telegram webhook update
     * @param updateData Raw update data from Telegram
     * @param signature Webhook signature for verification
     */
    public void processUpdate(Map<String, Object> updateData, String signature) {
        log.info("Processing Telegram update: {}", updateData.keySet());

        try {
            // Verify webhook signature if secret is configured
            if (telegramProperties.getWebhookSecret() != null && !telegramProperties.getWebhookSecret().isEmpty()) {
                if (!securityService.verifyWebhookSignature(updateData, signature)) {
                    log.warn("Invalid webhook signature, rejecting update");
                    return;
                }
            }

            // Parse update to structured object
            TelegramUpdate update = TelegramUpdate.fromMap(updateData);
            
            if (update == null) {
                log.warn("Failed to parse Telegram update: {}", updateData);
                return;
            }

            // Handle different types of updates
            if (update.getMessage() != null) {
                handleMessage(update);
            } else if (update.getCallbackQuery() != null) {
                handleCallbackQuery(update);
            } else {
                log.debug("Unhandled update type: {}", updateData.keySet());
            }

        } catch (Exception e) {
            log.error("Error processing Telegram update", e);
            // Don't rethrow - we want to return 200 to Telegram even on errors
        }
    }

    /**
     * Handle text messages and commands
     */
    private void handleMessage(TelegramUpdate update) {
        var message = update.getMessage();
        String text = message.getText();
        
        if (text == null || text.trim().isEmpty()) {
            log.debug("Ignoring empty message");
            return;
        }

        Long chatId = message.getChat().getId();
        Long userId = message.getFrom().getId();
        String username = message.getFrom().getUsername();

        log.info("Processing message from user {} ({}): {}", userId, username, text);

        // Handle commands
        if (text.startsWith("/")) {
            commandHandler.handleCommand(chatId, userId, username, text, message);
        } else {
            // Handle regular text messages
            commandHandler.handleTextMessage(chatId, userId, username, text);
        }
    }

    /**
     * Handle callback queries (inline keyboard responses)
     */
    private void handleCallbackQuery(TelegramUpdate update) {
        var callbackQuery = update.getCallbackQuery();
        String data = callbackQuery.getData();
        Long chatId = callbackQuery.getMessage().getChat().getId();
        Long userId = callbackQuery.getFrom().getId();

        log.info("Processing callback query from user {}: {}", userId, data);

        commandHandler.handleCallbackQuery(chatId, userId, data, callbackQuery);
    }
}