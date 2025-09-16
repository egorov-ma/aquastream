package org.aquastream.notification.api.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.notification.service.telegram.TelegramWebhookService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/notify/telegram")
@RequiredArgsConstructor
@Slf4j
public class TelegramWebhookController {

    private final TelegramWebhookService telegramWebhookService;

    /**
     * Telegram webhook endpoint for processing bot updates
     * This endpoint receives updates from Telegram when users interact with the bot
     */
    @PostMapping("/webhook")
    public ResponseEntity<Map<String, String>> handleWebhook(
            @RequestBody Map<String, Object> update,
            HttpServletRequest request) {

        log.info("Received Telegram webhook update: {}", update.keySet());
        log.debug("Full webhook payload: {}", update);

        try {
            // Verify webhook signature if secret is configured
            String signature = request.getHeader("X-Telegram-Bot-Api-Secret-Token");
            
            // Process the update
            telegramWebhookService.processUpdate(update, signature);
            
            return ResponseEntity.ok(Map.of("status", "ok"));
            
        } catch (Exception e) {
            log.error("Error processing Telegram webhook", e);
            // Always return 200 to prevent Telegram from retrying
            return ResponseEntity.ok(Map.of("status", "error", "message", "Internal error"));
        }
    }

    /**
     * Health check endpoint for Telegram webhook
     */
    @GetMapping("/webhook/health")
    public ResponseEntity<Map<String, String>> webhookHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "healthy",
                "service", "telegram-webhook",
                "timestamp", String.valueOf(System.currentTimeMillis())
        ));
    }
}


