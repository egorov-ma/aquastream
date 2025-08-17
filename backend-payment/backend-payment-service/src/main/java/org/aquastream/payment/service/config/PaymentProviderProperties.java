package org.aquastream.payment.service.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Data
@Component
@ConfigurationProperties(prefix = "app.payment.providers")
public class PaymentProviderProperties {

    private TinkoffConfig tinkoff = new TinkoffConfig();
    private SberConfig sber = new SberConfig();
    private YookassaConfig yookassa = new YookassaConfig();

    @Data
    public static class TinkoffConfig {
        private String terminalKey;
        private String secretKey;
        private String apiUrl = "https://securepay.tinkoff.ru";
        private boolean enabled = true;
    }

    @Data
    public static class SberConfig {
        private String merchantId;
        private String secretKey;
        private String apiUrl = "https://3dsec.sberbank.ru/payment/rest";
        private boolean enabled = false;
    }

    @Data
    public static class YookassaConfig {
        private String shopId;
        private String secretKey;
        private String apiUrl = "https://api.yookassa.ru/v3";
        private boolean enabled = false;
    }
}

