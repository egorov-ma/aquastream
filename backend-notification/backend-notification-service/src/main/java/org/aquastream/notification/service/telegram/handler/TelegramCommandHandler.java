package org.aquastream.notification.service.telegram.handler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.notification.service.config.TelegramProperties;
import org.aquastream.notification.service.telegram.TelegramBotService;
import org.aquastream.notification.service.telegram.TelegramSecurityService;
import org.aquastream.notification.service.telegram.dto.TelegramCallbackQuery;
import org.aquastream.notification.service.telegram.dto.TelegramMessage;
import org.aquastream.notification.service.user.UserLinkService;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class TelegramCommandHandler {

    private final TelegramBotService telegramBotService;
    private final TelegramSecurityService securityService;
    private final UserLinkService userLinkService;
    private final TelegramProperties telegramProperties;

    /**
     * Handle bot commands (/start, /help, etc.)
     */
    public void handleCommand(Long chatId, Long userId, String username, String text, TelegramMessage message) {
        if (securityService.isRateLimited(userId)) {
            log.warn("Rate limited user {}", userId);
            return;
        }

        String sanitizedText = securityService.sanitizeUserInput(text);
        if (sanitizedText == null || sanitizedText.trim().isEmpty()) {
            return;
        }

        String[] parts = sanitizedText.trim().split("\\s+", 2);
        String command = parts[0].toLowerCase();
        String args = parts.length > 1 ? parts[1] : "";

        log.info("Processing command '{}' from user {} with args: '{}'", command, userId, args);

        switch (command) {
            case "/start" -> handleStartCommand(chatId, userId, username, args);
            case "/help" -> handleHelpCommand(chatId, userId);
            case "/stop" -> handleStopCommand(chatId, userId);
            case "/verify" -> handleVerifyCommand(chatId, userId, args);
            case "/status" -> handleStatusCommand(chatId, userId);
            default -> handleUnknownCommand(chatId, command);
        }
    }

    /**
     * Handle /start command with deep-link support
     */
    private void handleStartCommand(Long chatId, Long userId, String username, String args) {
        String welcomeMessage = "🌊 Добро пожаловать в AquaStream!\n\n" +
                "Этот бот поможет вам получать уведомления о ваших бронированиях, " +
                "статусе платежей и событиях.\n\n" +
                "Доступные команды:\n" +
                "/help - показать это сообщение\n" +
                "/status - проверить статус привязки аккаунта\n" +
                "/stop - отключить уведомления";

        // Check if this is a deep-link with verification code
        if (args != null && !args.trim().isEmpty()) {
            String linkCode = args.trim();
            log.info("Processing account linking with code: {} for user: {}", linkCode, userId);
            
            try {
                // Attempt to link the account
                boolean success = userLinkService.confirmTelegramLink(linkCode, chatId, userId, username);
                
                if (success) {
                    String successMessage = "✅ Аккаунт успешно привязан!\n\n" +
                            "Теперь вы будете получать уведомления о:\n" +
                            "• Подтверждении бронирований\n" +
                            "• Статусе платежей\n" +
                            "• Напоминаниях о событиях\n" +
                            "• Освобождении мест в листе ожидания\n\n" +
                            "Используйте /help для получения дополнительной информации.";
                    
                    telegramBotService.sendMessage(chatId, successMessage);
                } else {
                    String errorMessage = "❌ Не удалось привязать аккаунт\n\n" +
                            "Возможные причины:\n" +
                            "• Неверный или просроченный код\n" +
                            "• Код уже был использован\n" +
                            "• Технические проблемы\n\n" +
                            "Попробуйте получить новый код привязки в личном кабинете.";
                    
                    telegramBotService.sendMessage(chatId, errorMessage);
                }
                
            } catch (Exception e) {
                log.error("Error linking account for user {} with code {}", userId, linkCode, e);
                
                String errorMessage = "❌ Произошла ошибка при привязке аккаунта\n\n" +
                        "Попробуйте позже или обратитесь в поддержку.";
                
                telegramBotService.sendMessage(chatId, errorMessage);
            }
        } else {
            // Regular start command without deep-link
            telegramBotService.sendMessage(chatId, welcomeMessage);
        }
    }

    /**
     * Handle /help command
     */
    private void handleHelpCommand(Long chatId, Long userId) {
        String helpMessage = "🆘 Справка по AquaStream боту\n\n" +
                "Доступные команды:\n\n" +
                "/start - перезапустить бота\n" +
                "/help - показать эту справку\n" +
                "/status - проверить статус привязки аккаунта\n" +
                "/stop - отключить все уведомления\n\n" +
                "❓ Как привязать аккаунт:\n" +
                "1. Войдите в личный кабинет AquaStream\n" +
                "2. Перейдите в настройки профиля\n" +
                "3. Нажмите 'Привязать Telegram'\n" +
                "4. Перейдите по ссылке или введите код\n\n" +
                "📞 Поддержка: @aquastream_support";

        telegramBotService.sendMessage(chatId, helpMessage);
    }

    /**
     * Handle /stop command
     */
    private void handleStopCommand(Long chatId, Long userId) {
        try {
            boolean success = userLinkService.deactivateTelegramSubscription(chatId, userId);
            
            if (success) {
                String message = "🔕 Уведомления отключены\n\n" +
                        "Вы больше не будете получать уведомления от AquaStream.\n\n" +
                        "Чтобы снова включить уведомления, " +
                        "перепривяжите аккаунт в личном кабинете.";
                
                telegramBotService.sendMessage(chatId, message);
            } else {
                String message = "❌ Не удалось отключить уведомления\n\n" +
                        "Возможно, ваш аккаунт еще не привязан или уже отключен.";
                
                telegramBotService.sendMessage(chatId, message);
            }
            
        } catch (Exception e) {
            log.error("Error deactivating subscription for user {}", userId, e);
            
            String message = "❌ Произошла ошибка при отключении уведомлений\n\n" +
                    "Попробуйте позже или обратитесь в поддержку.";
            
            telegramBotService.sendMessage(chatId, message);
        }
    }

    /**
     * Handle /verify command with code
     */
    private void handleVerifyCommand(Long chatId, Long userId, String args) {
        if (args == null || args.trim().isEmpty()) {
            String message = "❌ Укажите код привязки\n\n" +
                    "Использование: /verify <код>\n" +
                    "Пример: /verify ABC123\n\n" +
                    "Код можно получить в личном кабинете AquaStream.";
            
            telegramBotService.sendMessage(chatId, message);
            return;
        }

        // Same logic as /start with deep-link
        handleStartCommand(chatId, userId, null, args.trim());
    }

    /**
     * Handle /status command
     */
    private void handleStatusCommand(Long chatId, Long userId) {
        try {
            boolean isLinked = userLinkService.isTelegramLinked(chatId, userId);
            
            String message;
            if (isLinked) {
                message = "✅ Аккаунт привязан\n\n" +
                        "Ваш Telegram аккаунт успешно привязан к AquaStream.\n" +
                        "Вы получаете уведомления о событиях.\n\n" +
                        "Используйте /stop для отключения уведомлений.";
            } else {
                message = "❌ Аккаунт не привязан\n\n" +
                        "Ваш Telegram аккаунт не привязан к AquaStream.\n\n" +
                        "Чтобы привязать аккаунт:\n" +
                        "1. Войдите в личный кабинет\n" +
                        "2. Перейдите в настройки профиля\n" +
                        "3. Нажмите 'Привязать Telegram'";
            }
            
            telegramBotService.sendMessage(chatId, message);
            
        } catch (Exception e) {
            log.error("Error checking status for user {}", userId, e);
            
            String message = "❌ Не удалось проверить статус\n\n" +
                    "Попробуйте позже или обратитесь в поддержку.";
            
            telegramBotService.sendMessage(chatId, message);
        }
    }

    /**
     * Handle unknown commands
     */
    private void handleUnknownCommand(Long chatId, String command) {
        String message = "❓ Неизвестная команда: " + command + "\n\n" +
                "Используйте /help для просмотра доступных команд.";
        
        telegramBotService.sendMessage(chatId, message);
    }

    /**
     * Handle regular text messages (non-commands)
     */
    public void handleTextMessage(Long chatId, Long userId, String username, String text) {
        if (securityService.isRateLimited(userId)) {
            return;
        }

        log.debug("Received text message from user {}: {}", userId, text);
        
        // For now, just respond with help message
        String message = "Привет! 👋\n\n" +
                "Я бот AquaStream для уведомлений.\n" +
                "Используйте /help для просмотра доступных команд.";
        
        telegramBotService.sendMessage(chatId, message);
    }

    /**
     * Handle callback queries from inline keyboards
     */
    public void handleCallbackQuery(Long chatId, Long userId, String data, TelegramCallbackQuery callbackQuery) {
        if (securityService.isRateLimited(userId)) {
            return;
        }

        log.info("Processing callback query from user {}: {}", userId, data);
        
        // Handle different callback data patterns
        if (data.startsWith("link_")) {
            handleLinkCallback(chatId, userId, data);
        } else if (data.startsWith("prefs_")) {
            handlePreferencesCallback(chatId, userId, data);
        } else {
            log.warn("Unknown callback data pattern: {}", data);
        }
    }

    private void handleLinkCallback(Long chatId, Long userId, String data) {
        // Handle account linking callbacks
        String message = "Функция в разработке. Используйте команды для управления аккаунтом.";
        telegramBotService.sendMessage(chatId, message);
    }

    private void handlePreferencesCallback(Long chatId, Long userId, String data) {
        // Handle notification preferences callbacks
        String message = "Управление настройками уведомлений доступно в личном кабинете.";
        telegramBotService.sendMessage(chatId, message);
    }
}