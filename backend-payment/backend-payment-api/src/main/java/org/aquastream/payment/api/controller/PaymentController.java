package org.aquastream.payment.api.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.payment.service.PaymentService;
import org.aquastream.payment.service.dto.PaymentInitRequest;
import org.aquastream.payment.service.dto.PaymentInitResponse;
import org.aquastream.payment.service.dto.WebhookRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Validated
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/{bookingId}/init")
    public ResponseEntity<PaymentInitResponse> initializePayment(
            @PathVariable UUID bookingId,
            @Valid @RequestBody PaymentInitRequest request,
            HttpServletRequest httpRequest) {

        log.info("Initializing payment for booking: {}", bookingId);

        request.setBookingId(bookingId);

        PaymentInitResponse response = paymentService.initializePayment(bookingId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/webhook/{provider}")
    public ResponseEntity<Map<String, String>> processWebhook(
            @PathVariable String provider,
            @RequestBody Map<String, Object> payload,
            HttpServletRequest httpRequest) {

        log.info("Received webhook from provider: {}", provider);

        try {
            // Extract request body as string
            String rawBody = extractRawBody(httpRequest);

            // Extract headers
            Map<String, String> headers = extractHeaders(httpRequest);

            // Create webhook request
            WebhookRequest webhookRequest = WebhookRequest.builder()
                    .providerName(provider)
                    .payload(payload)
                    .headers(headers)
                    .rawBody(rawBody)
                    .signature(headers.get("x-api-signature-sha256"))
                    .sourceIp(getClientIpAddress(httpRequest))
                    .build();

            // Process webhook
            paymentService.processWebhook(provider, webhookRequest);

            return ResponseEntity.ok(Map.of("status", "success"));

        } catch (Exception e) {
            log.error("Error processing webhook from provider: {}", provider, e);
            throw e;
        }
    }

    private String extractRawBody(HttpServletRequest request) {
        try {
            return new String(request.getInputStream().readAllBytes());
        } catch (IOException e) {
            log.error("Error reading request body", e);
            return "";
        }
    }

    private Map<String, String> extractHeaders(HttpServletRequest request) {
        Map<String, String> headers = new HashMap<>();
        
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            headers.put(headerName.toLowerCase(), request.getHeader(headerName));
        }
        
        return headers;
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}