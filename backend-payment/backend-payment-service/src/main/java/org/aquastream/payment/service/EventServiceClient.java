package org.aquastream.payment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.common.config.ServiceUrls;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * REST client for communication with Event Service.
 * Handles booking confirmation after successful payment.
 * Uses centralized service configuration for improved maintainability.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EventServiceClient {
    
    @Qualifier("eventServiceRestTemplate")
    private final RestTemplate restTemplate;
    
    private final ServiceUrls serviceUrls;
    
    /**
     * Notify event service about payment status update
     */
    public void updateBookingPaymentStatus(UUID paymentId, String paymentStatus) {
        try {
            log.info("Updating booking payment status for payment {} to {}", paymentId, paymentStatus);
            
            String url = serviceUrls.getEvent().getBaseUrl() + "/api/v1/bookings/payment/" + paymentId + "/status";
            
            Map<String, Object> request = new HashMap<>();
            request.put("paymentId", paymentId);
            request.put("paymentStatus", paymentStatus);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.PUT, entity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Successfully updated booking payment status for payment {}", paymentId);
            } else {
                log.warn("Event service returned non-success status: {} for payment {}", 
                        response.getStatusCode(), paymentId);
            }
            
        } catch (Exception e) {
            log.error("Failed to update booking payment status for payment {}: {}", 
                    paymentId, e.getMessage(), e);
            // Don't throw exception - payment was successful, this is just a notification
        }
    }
    
    /**
     * Confirm booking after successful payment
     */
    public void confirmBookingAfterPayment(UUID paymentId) {
        try {
            log.info("Confirming booking after successful payment for payment {}", paymentId);
            
            String url = serviceUrls.getEvent().getBaseUrl() + "/api/v1/bookings/payment/" + paymentId + "/confirm";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.PUT, entity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Successfully confirmed booking for payment {}", paymentId);
            } else {
                log.warn("Event service returned non-success status: {} for payment {}", 
                        response.getStatusCode(), paymentId);
            }
            
        } catch (Exception e) {
            log.error("Failed to confirm booking for payment {}: {}", paymentId, e.getMessage(), e);
            // Don't throw exception - payment was successful, this is just a notification
        }
    }
}