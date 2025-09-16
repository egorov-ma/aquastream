package org.aquastream.notification.service.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Data
@Component
@ConfigurationProperties(prefix = "app.telegram")
public class TelegramProperties {

    private BotConfig bot = new BotConfig();
    private ApiConfig api = new ApiConfig();

    @Data
    public static class BotConfig {
        private String token;
        private String webhookUrl;
        private String webhookSecret;
        private boolean enabled = true;
    }

    @Data
    public static class ApiConfig {
        private String baseUrl = "https://api.telegram.org/bot";
        private Duration timeout = Duration.ofSeconds(10);
        private int maxRetries = 3;
        private Duration retryDelay = Duration.ofSeconds(1);
    }

    // Convenience getters
    public String getBotToken() {
        return bot.getToken();
    }

    public String getWebhookUrl() {
        return bot.getWebhookUrl();
    }

    public String getWebhookSecret() {
        return bot.getWebhookSecret();
    }

    public boolean isBotEnabled() {
        return bot.isEnabled();
    }
}