package org.aquastream.payment.service.provider;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.payment.service.config.PaymentProviderProperties;
import org.aquastream.payment.service.dto.PaymentInitRequest;
import org.aquastream.payment.service.dto.PaymentInitResponse;
import org.aquastream.payment.service.dto.WebhookRequest;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class TinkoffPaymentProvider implements PaymentProvider {

    private final PaymentProviderProperties properties;

    @Override
    public String getProviderName() {
        return "tinkoff";
    }

    @Override
    public boolean isEnabled() {
        return properties.getTinkoff().isEnabled();
    }

    @Override
    public PaymentInitResponse initializePayment(PaymentInitRequest request) {
        log.info("Initializing Tinkoff payment for user {} amount {}", 
                request.getUserId(), request.getAmount());

        // Generate order ID and payment URL
        String orderId = "order_" + System.currentTimeMillis();
        String paymentUrl = generatePaymentUrl(request, orderId);

        // Create widget configuration
        PaymentInitResponse.PaymentWidget widget = PaymentInitResponse.PaymentWidget.builder()
                .type("redirect")
                .paymentUrl(paymentUrl)
                .confirmUrl(request.getReturnUrl())
                .cancelUrl(request.getFailUrl())
                .config(Map.of(
                    "terminal_key", properties.getTinkoff().getTerminalKey(),
                    "order_id", orderId,
                    "amount", request.getAmount().multiply(java.math.BigDecimal.valueOf(100)).longValue(), // Convert to kopecks
                    "currency", request.getCurrency(),
                    "description", request.getDescription()
                ))
                .style(PaymentInitResponse.WidgetStyle.builder()
                    .theme("light")
                    .primaryColor("#2196F3")
                    .language("ru")
                    .size("medium")
                    .build())
                .build();

        return PaymentInitResponse.builder()
                .paymentId(UUID.randomUUID()) // This would be saved to database
                .providerName(getProviderName())
                .status("PENDING")
                .widget(widget)
                .expiresAt(Instant.now().plusSeconds(15 * 60)) // 15 minutes
                .build();
    }

    @Override
    public boolean verifyWebhookSignature(WebhookRequest webhook) {
        try {
            String expectedSignature = webhook.getHeaders().get("x-api-signature-sha256");
            if (expectedSignature == null) {
                log.warn("No signature header found for Tinkoff webhook");
                return false;
            }

            // Tinkoff uses HMAC-SHA256
            String secretKey = properties.getTinkoff().getSecretKey();
            String calculatedSignature = calculateHmacSha256(webhook.getRawBody(), secretKey);

            boolean isValid = expectedSignature.equals(calculatedSignature);
            if (!isValid) {
                log.warn("Invalid signature for Tinkoff webhook. Expected: {}, Calculated: {}", 
                        expectedSignature, calculatedSignature);
            }
            
            return isValid;

        } catch (Exception e) {
            log.error("Error verifying Tinkoff webhook signature", e);
            return false;
        }
    }

    @Override
    public void processWebhook(WebhookRequest webhook) {
        Map<String, Object> payload = webhook.getPayload();
        
        String eventType = (String) payload.get("Status");
        String orderId = (String) payload.get("OrderId");
        String paymentId = (String) payload.get("PaymentId");
        
        log.info("Processing Tinkoff webhook: eventType={}, orderId={}, paymentId={}", 
                eventType, orderId, paymentId);

        // Process based on status
        switch (eventType) {
            case "CONFIRMED" -> handlePaymentConfirmed(payload);
            case "REJECTED" -> handlePaymentRejected(payload);
            case "CANCELED" -> handlePaymentCanceled(payload);
            default -> log.warn("Unknown Tinkoff webhook status: {}", eventType);
        }
    }

    @Override
    public String checkPaymentStatus(String providerPaymentId) {
        // Call Tinkoff GetState API
        log.debug("Checking Tinkoff payment status for: {}", providerPaymentId);
        // Implementation would make HTTP call to Tinkoff API
        return "UNKNOWN";
    }

    @Override
    public boolean cancelPayment(String providerPaymentId) {
        log.info("Canceling Tinkoff payment: {}", providerPaymentId);
        // Implementation would call Tinkoff Cancel API
        return false;
    }

    private String generatePaymentUrl(PaymentInitRequest request, String orderId) {
        String baseUrl = properties.getTinkoff().getApiUrl();
        return String.format("%s/v2/Init", baseUrl);
    }

    private String calculateHmacSha256(String data, String secretKey) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        
        // Convert to hex
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }

    private void handlePaymentConfirmed(Map<String, Object> payload) {
        log.info("Tinkoff payment confirmed: {}", payload);
        // Update payment status to SUCCEEDED
    }

    private void handlePaymentRejected(Map<String, Object> payload) {
        log.info("Tinkoff payment rejected: {}", payload);
        // Update payment status to REJECTED
    }

    private void handlePaymentCanceled(Map<String, Object> payload) {
        log.info("Tinkoff payment canceled: {}", payload);
        // Update payment status to CANCELED
    }
}