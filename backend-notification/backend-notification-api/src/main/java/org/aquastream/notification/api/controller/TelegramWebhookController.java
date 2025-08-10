package org.aquastream.notification.api.controller;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/notification/telegram")
@RequiredArgsConstructor
public class TelegramWebhookController {

    @Value("${app.telegram.botToken:}")
    private String botToken;

    @Value("${services.user.base-url:http://localhost:8101}")
    private String userServiceBaseUrl;

    @PostMapping(path = "/webhook", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> webhook(@RequestBody Update update) {
        if (update == null || update.getMessage() == null) {
            return ResponseEntity.ok(Map.of("ok", true));
        }
        String text = update.getMessage().getText();
        Long chatId = update.getMessage().getChat() != null ? update.getMessage().getChat().getId() : null;
        boolean ok = false;
        if (text != null && text.startsWith("/start")) {
            String[] parts = text.split(" ", 2);
            if (parts.length == 2) {
                String code = parts[1].trim();
                // проксируем confirm в backend-user
                try {
                    RestTemplate rt = new RestTemplate();
                    String url = userServiceBaseUrl + "/api/v1/telegram/link/confirm?code=" + code;
                    rt.postForEntity(url, null, String.class);
                    ok = true;
                } catch (Exception e) {
                    ok = false;
                }
            }
        }
        if (chatId != null && botToken != null && !botToken.isBlank()) {
            sendTelegramMessage(chatId, ok ? "✅ Аккаунт успешно привязан" : "❌ Неверный или просроченный код");
        }
        return ResponseEntity.ok(Map.of("ok", true));
    }

    private void sendTelegramMessage(Long chatId, String text) {
        try {
            String url = "https://api.telegram.org/bot" + botToken + "/sendMessage";
            RestTemplate rt = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> req = new HttpEntity<>(Map.of(
                    "chat_id", chatId,
                    "text", text
            ), headers);
            rt.postForEntity(url, req, String.class);
        } catch (Exception ignored) { }
    }

    @Data
    public static class Update { private Message message; }
    @Data
    public static class Message { private Long message_id; private Chat chat; private String text; }
    @Data
    public static class Chat { private Long id; private String type; private String username; }
}


