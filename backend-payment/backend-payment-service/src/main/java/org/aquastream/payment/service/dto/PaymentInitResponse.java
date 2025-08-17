package org.aquastream.payment.service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentInitResponse {

    private UUID paymentId;
    
    private String providerName;
    
    private String status;
    
    // Widget configuration
    private PaymentWidget widget;
    
    private Instant expiresAt;
    
    private Map<String, Object> metadata;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PaymentWidget {
        
        // Common widget config
        private String type; // "embedded", "redirect", "popup"
        
        private String paymentUrl;
        
        private String confirmUrl; // Redirect URL after payment
        
        private String cancelUrl;  // Redirect URL on cancel
        
        // Provider-specific configuration
        private Map<String, Object> config;
        
        // Widget styling
        private WidgetStyle style;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class WidgetStyle {
        
        private String theme; // "light", "dark", "auto"
        
        private String primaryColor;
        
        private String language; // "ru", "en"
        
        private String size; // "small", "medium", "large"
    }
}