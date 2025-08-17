package org.aquastream.payment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.payment.db.entity.PaymentEntity;
import org.aquastream.payment.db.entity.WebhookEventEntity;
import org.aquastream.payment.db.repository.PaymentRepository;
import org.aquastream.payment.db.repository.WebhookEventRepository;
import org.aquastream.payment.service.config.PaymentProperties;
import org.aquastream.payment.service.dto.PaymentInitRequest;
import org.aquastream.payment.service.dto.PaymentInitResponse;
import org.aquastream.payment.service.dto.WebhookRequest;
import org.aquastream.payment.service.provider.PaymentProvider;
import org.aquastream.payment.service.webhook.WebhookProcessor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentService {

    private final List<PaymentProvider> paymentProviders;
    private final PaymentRepository paymentRepository;
    private final WebhookEventRepository webhookEventRepository;
    private final WebhookProcessor webhookProcessor;
    private final PaymentProperties paymentProperties;

    public PaymentInitResponse initializePayment(UUID bookingId, PaymentInitRequest request) {
        log.info("Initializing payment for booking: {}, user: {}, amount: {}", 
                bookingId, request.getUserId(), request.getAmount());

        // Validate amount limits
        validateAmount(request);

        // Check for existing pending payment
        checkDuplicatePayment(request);

        // Get enabled provider (for now, take first enabled)
        PaymentProvider provider = getEnabledProvider();

        // Generate idempotency key
        String idempotencyKey = generateIdempotencyKey(request);

        // Create payment entity
        PaymentEntity payment = PaymentEntity.builder()
                .userId(request.getUserId())
                .eventId(request.getEventId())
                .amountKopecks(request.getAmount().multiply(java.math.BigDecimal.valueOf(100)).longValue())
                .currency(request.getCurrency())
                .providerName(provider.getProviderName())
                .idempotencyKey(idempotencyKey)
                .description(request.getDescription())
                .metadata(request.getMetadata())
                .status(PaymentEntity.PaymentStatus.PENDING)
                .expiresAt(Instant.now().plus(paymentProperties.getTimeouts().getPaymentExpiry()))
                .build();

        try {
            payment = paymentRepository.save(payment);
            log.info("Created payment entity with ID: {}", payment.getId());

        } catch (DataIntegrityViolationException e) {
            log.warn("Duplicate payment attempt detected for idempotency key: {}", idempotencyKey);
            // Find existing payment
            PaymentEntity existing = paymentRepository
                    .findByProviderNameAndIdempotencyKey(provider.getProviderName(), idempotencyKey)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, 
                            "Payment already exists but not found"));
            
            // Return existing payment configuration
            return buildPaymentResponse(existing, provider, request);
        }

        // Initialize payment with provider
        PaymentInitResponse response = provider.initializePayment(request);
        response.setPaymentId(payment.getId());

        // Update payment with provider details
        if (response.getWidget() != null && response.getWidget().getConfig() != null) {
            String providerPaymentId = (String) response.getWidget().getConfig().get("order_id");
            if (providerPaymentId != null) {
                payment.setProviderPaymentId(providerPaymentId);
                paymentRepository.save(payment);
            }
        }

        return response;
    }

    @Transactional
    public void processWebhook(String providerName, WebhookRequest webhook) {
        log.info("Processing webhook from provider: {}", providerName);

        webhook.setProviderName(providerName);

        // Find provider
        PaymentProvider provider = findProvider(providerName);
        if (provider == null) {
            log.warn("Unknown payment provider: {}", providerName);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown provider");
        }

        // Verify signature
        if (!provider.verifyWebhookSignature(webhook)) {
            log.warn("Invalid webhook signature from provider: {}", providerName);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid signature");
        }

        // Generate idempotency key for webhook
        String webhookIdempotencyKey = generateWebhookIdempotencyKey(webhook);

        // Extract provider event ID
        String providerEventId = extractProviderEventId(webhook);

        // Create webhook event entity
        WebhookEventEntity webhookEvent = WebhookEventEntity.builder()
                .providerName(providerName)
                .providerEventId(providerEventId)
                .eventType(extractEventType(webhook))
                .rawPayload(webhook.getPayload())
                .idempotencyKey(webhookIdempotencyKey)
                .httpHeaders(webhook.getHeaders())
                .sourceIp(webhook.getSourceIp())
                .status(WebhookEventEntity.WebhookStatus.PENDING)
                .build();

        try {
            webhookEvent = webhookEventRepository.save(webhookEvent);
            log.info("Created webhook event with ID: {}", webhookEvent.getId());

        } catch (DataIntegrityViolationException e) {
            log.info("Duplicate webhook detected for key: {}", webhookIdempotencyKey);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Webhook already processed");
        }

        // Process webhook
        try {
            webhookProcessor.processWebhookEvent(webhookEvent, provider);
            
            webhookEvent.setStatus(WebhookEventEntity.WebhookStatus.PROCESSED);
            webhookEvent.setProcessedAt(Instant.now());
            webhookEventRepository.save(webhookEvent);

        } catch (Exception e) {
            log.error("Error processing webhook event: {}", webhookEvent.getId(), e);
            
            webhookEvent.setStatus(WebhookEventEntity.WebhookStatus.FAILED);
            webhookEvent.setLastError(e.getMessage());
            webhookEvent.incrementProcessingAttempts();
            webhookEventRepository.save(webhookEvent);
            
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Webhook processing failed");
        }
    }

    private void validateAmount(PaymentInitRequest request) {
        long amountKopecks = request.getAmount().multiply(java.math.BigDecimal.valueOf(100)).longValue();
        
        if (amountKopecks < paymentProperties.getLimits().getMinAmountKopecks()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Amount below minimum limit");
        }
        
        if (amountKopecks > paymentProperties.getLimits().getMaxAmountKopecks()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Amount exceeds maximum limit");
        }
    }

    private void checkDuplicatePayment(PaymentInitRequest request) {
        // Check for existing pending payments for the same user and event
        boolean hasPendingPayment = paymentRepository.existsByUserIdAndEventIdAndStatus(
                request.getUserId(), request.getEventId(), PaymentEntity.PaymentStatus.PENDING);
        
        if (hasPendingPayment) {
            log.warn("User {} already has pending payment for event {}", 
                    request.getUserId(), request.getEventId());
            throw new ResponseStatusException(HttpStatus.CONFLICT, 
                    "Pending payment already exists for this event");
        }
    }

    private PaymentProvider getEnabledProvider() {
        return paymentProviders.stream()
                .filter(PaymentProvider::isEnabled)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, 
                        "No payment providers available"));
    }

    private PaymentProvider findProvider(String providerName) {
        return paymentProviders.stream()
                .filter(p -> p.getProviderName().equals(providerName))
                .findFirst()
                .orElse(null);
    }

    private PaymentInitResponse buildPaymentResponse(PaymentEntity payment, PaymentProvider provider, 
                                                   PaymentInitRequest request) {
        // Build response for existing payment
        return PaymentInitResponse.builder()
                .paymentId(payment.getId())
                .providerName(payment.getProviderName())
                .status(payment.getStatus().name())
                .expiresAt(payment.getExpiresAt())
                .build();
    }

    private String generateIdempotencyKey(PaymentInitRequest request) {
        String data = String.format("%s_%s_%s_%s_%d", 
                request.getUserId(), 
                request.getEventId(),
                request.getAmount(),
                request.getCurrency(),
                System.currentTimeMillis() / 60000); // Group by minute

        return hashString(data);
    }

    private String generateWebhookIdempotencyKey(WebhookRequest webhook) {
        String data = webhook.getProviderName() + "_" + 
                      extractProviderEventId(webhook) + "_" + 
                      hashString(webhook.getRawBody());
        return hashString(data);
    }

    private String extractProviderEventId(WebhookRequest webhook) {
        // Extract event ID from payload based on provider
        Map<String, Object> payload = webhook.getPayload();
        
        return switch (webhook.getProviderName()) {
            case "tinkoff" -> (String) payload.get("OrderId");
            case "sber" -> (String) payload.get("orderId");
            case "yookassa" -> (String) payload.get("id");
            default -> "unknown_" + System.currentTimeMillis();
        };
    }

    private String extractEventType(WebhookRequest webhook) {
        Map<String, Object> payload = webhook.getPayload();
        
        return switch (webhook.getProviderName()) {
            case "tinkoff" -> "payment." + ((String) payload.get("Status")).toLowerCase();
            case "sber" -> "payment." + ((String) payload.get("status")).toLowerCase();
            case "yookassa" -> (String) payload.get("event");
            default -> "unknown";
        };
    }

    private String hashString(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes());
            return HexFormat.of().formatHex(hash).substring(0, 16); // Take first 16 chars
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}