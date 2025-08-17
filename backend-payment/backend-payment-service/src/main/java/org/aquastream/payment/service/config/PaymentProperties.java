package org.aquastream.payment.service.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Data
@Component
@ConfigurationProperties(prefix = "app.payment")
public class PaymentProperties {

    private TimeoutConfig timeouts = new TimeoutConfig();
    private LimitConfig limits = new LimitConfig();
    private ReceiptConfig receipt = new ReceiptConfig();

    @Data
    public static class TimeoutConfig {
        private Duration paymentExpiry = Duration.ofMinutes(15);
        private Duration statusCheckDelay = Duration.ofMinutes(5);
        private Duration webhookRetryDelay = Duration.ofMinutes(1);
        private int maxRetryAttempts = 5;
    }

    @Data
    public static class LimitConfig {
        private long minAmountKopecks = 100;
        private long maxAmountKopecks = 10000000;
        private long dailyLimitKopecks = 100000000;
    }

    @Data
    public static class ReceiptConfig {
        private boolean enabled = false;
        private String ofdUrl;
        private String inn;
        private String paymentObject = "service";
        private String paymentMethod = "full_payment";
        private String vat = "none";
    }
}