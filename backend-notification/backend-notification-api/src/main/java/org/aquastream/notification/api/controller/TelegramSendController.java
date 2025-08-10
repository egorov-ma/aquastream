package org.aquastream.notification.api.controller;

import lombok.Data;
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
public class TelegramSendController {

    @Value("${app.telegram.botToken:}")
    private String botToken;

    @PostMapping("/send")
    public ResponseEntity<?> send(@RequestBody SendRequest req) {
        if (botToken == null || botToken.isBlank()) {
            return ResponseEntity.status(503).body(Map.of("ok", false, "reason", "bot token not configured"));
        }
        if (req.chatId == null) {
            // no chat id known, acknowledge for now
            return ResponseEntity.ok(Map.of("ok", true, "sent", false));
        }
        try {
            String url = "https://api.telegram.org/bot" + botToken + "/sendMessage";
            RestTemplate rt = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> http = new HttpEntity<>(Map.of(
                    "chat_id", req.chatId,
                    "text", req.text
            ), headers);
            rt.postForEntity(url, http, String.class);
            return ResponseEntity.ok(Map.of("ok", true, "sent", true));
        } catch (Exception e) {
            return ResponseEntity.status(502).body(Map.of("ok", false));
        }
    }

    @Data
    public static class SendRequest {
        public Long chatId;
        public String username;
        public String text;
    }
}


