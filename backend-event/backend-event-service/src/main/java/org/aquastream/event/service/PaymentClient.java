package org.aquastream.event.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.common.config.ServiceUrls;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * REST client for communication with Payment Service.
 * Handles payment initialization and payment-related operations.
 * Uses centralized service configuration for improved maintainability.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentClient {
    
    @Qualifier("paymentServiceRestTemplate")
    private final RestTemplate restTemplate;
    
    private final ServiceUrls serviceUrls;
    
    /**
     * Initialize payment for a booking
     */
    public PaymentInitResponse initializePayment(UUID bookingId, UUID userId, BigDecimal amount, String description) {
        try {
            log.info("Initializing payment for booking {} with amount {}", bookingId, amount);
            
            String url = serviceUrls.getPayment().getBaseUrl() + "/api/v1/payments/" + bookingId + "/init";
            
            Map<String, Object> request = new HashMap<>();
            request.put("userId", userId);
            request.put("amount", amount);
            request.put("currency", "RUB");
            request.put("description", description);
            request.put("bookingId", bookingId);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<PaymentInitResponse> response = restTemplate.postForEntity(
                    url, entity, PaymentInitResponse.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                PaymentInitResponse paymentResponse = response.getBody();
                log.info("Payment initialized successfully for booking {}, payment ID: {}", 
                        bookingId, paymentResponse != null ? paymentResponse.getPaymentId() : "null");
                return paymentResponse;
            } else {
                throw new RuntimeException("Payment service returned error: " + response.getStatusCode());
            }
            
        } catch (Exception e) {
            log.error("Failed to initialize payment for booking {}: {}", bookingId, e.getMessage(), e);
            throw new RuntimeException("Payment initialization failed", e);
        }
    }
    
    /**
     * DTO for payment initialization response
     */
    public static class PaymentInitResponse {
        private UUID paymentId;
        private String paymentUrl;
        private String qrCode;
        private String status;
        
        // Getters and setters
        public UUID getPaymentId() { return paymentId; }
        public void setPaymentId(UUID paymentId) { this.paymentId = paymentId; }
        
        public String getPaymentUrl() { return paymentUrl; }
        public void setPaymentUrl(String paymentUrl) { this.paymentUrl = paymentUrl; }
        
        public String getQrCode() { return qrCode; }
        public void setQrCode(String qrCode) { this.qrCode = qrCode; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}