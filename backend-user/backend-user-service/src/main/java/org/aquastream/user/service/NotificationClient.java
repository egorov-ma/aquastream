package org.aquastream.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationClient {

    @Value("${services.notification.base-url:http://localhost:8105}")
    private String notificationBaseUrl;

    public void sendTelegram(String username, String text) {
        RestClient client = RestClient.builder()
                .baseUrl(notificationBaseUrl)
                .build();

        try {
            client.post()
                    .uri("/api/v1/notification/telegram/send")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("username", username, "text", text))
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception ignored) {
        }
    }
}

