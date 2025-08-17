package org.aquastream.payment.service.webhook;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.payment.db.entity.PaymentEntity;
import org.aquastream.payment.db.entity.PaymentStatusLogEntity;
import org.aquastream.payment.db.entity.WebhookEventEntity;
import org.aquastream.payment.db.repository.PaymentRepository;
import org.aquastream.payment.db.repository.PaymentStatusLogRepository;
import org.aquastream.payment.service.provider.PaymentProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebhookProcessor {

    private final PaymentRepository paymentRepository;
    private final PaymentStatusLogRepository statusLogRepository;

    @Transactional
    public void processWebhookEvent(WebhookEventEntity webhookEvent, PaymentProvider provider) {
        log.info("Processing webhook event: {} for provider: {}", 
                webhookEvent.getId(), webhookEvent.getProviderName());

        // Extract payment information from webhook
        String providerPaymentId = extractProviderPaymentId(webhookEvent);
        if (providerPaymentId == null) {
            log.warn("No provider payment ID found in webhook: {}", webhookEvent.getId());
            return;
        }

        // Find payment by provider payment ID
        Optional<PaymentEntity> paymentOpt = paymentRepository
                .findByProviderNameAndProviderPaymentId(
                        webhookEvent.getProviderName(), providerPaymentId);

        if (paymentOpt.isEmpty()) {
            log.warn("Payment not found for provider payment ID: {}", providerPaymentId);
            
            // Store provider payment ID for later association
            webhookEvent.setProviderPaymentId(providerPaymentId);
            return;
        }

        PaymentEntity payment = paymentOpt.get();
        
        // Link webhook to payment
        webhookEvent.setPaymentId(payment.getId());
        webhookEvent.setProviderPaymentId(providerPaymentId);

        // Determine new status based on webhook event
        PaymentEntity.PaymentStatus newStatus = determinePaymentStatus(webhookEvent);
        PaymentEntity.PaymentStatus oldStatus = payment.getStatus();

        if (newStatus != null && newStatus != oldStatus) {
            log.info("Updating payment {} status from {} to {}", 
                    payment.getId(), oldStatus, newStatus);

            // Update payment status
            payment.setStatus(newStatus);
            payment.setUpdatedAt(Instant.now());

            // Set completion timestamp for final statuses
            if (payment.isCompleted() && payment.getCompletedAt() == null) {
                payment.setCompletedAt(Instant.now());
            }

            paymentRepository.save(payment);

            // Create status log entry
            PaymentStatusLogEntity statusLog = PaymentStatusLogEntity.builder()
                    .paymentId(payment.getId())
                    .oldStatus(oldStatus)
                    .newStatus(newStatus)
                    .reason("webhook")
                    .webhookEventId(webhookEvent.getId())
                    .details(Map.of(
                        "webhook_event_type", webhookEvent.getEventType(),
                        "provider_event_id", webhookEvent.getProviderEventId()
                    ))
                    .build();

            statusLogRepository.save(statusLog);

            log.info("Payment {} status updated successfully", payment.getId());
        } else {
            log.debug("No status change needed for payment {}", payment.getId());
        }
    }

    private String extractProviderPaymentId(WebhookEventEntity webhookEvent) {
        Map<String, Object> payload = webhookEvent.getRawPayload();
        
        return switch (webhookEvent.getProviderName()) {
            case "tinkoff" -> (String) payload.get("PaymentId");
            case "sber" -> (String) payload.get("paymentId");
            case "yookassa" -> {
                Map<String, Object> object = (Map<String, Object>) payload.get("object");
                yield object != null ? (String) object.get("id") : null;
            }
            default -> null;
        };
    }

    private PaymentEntity.PaymentStatus determinePaymentStatus(WebhookEventEntity webhookEvent) {
        String eventType = webhookEvent.getEventType();
        
        return switch (webhookEvent.getProviderName()) {
            case "tinkoff" -> mapTinkoffStatus(eventType);
            case "sber" -> mapSberStatus(eventType);
            case "yookassa" -> mapYookassaStatus(eventType);
            default -> null;
        };
    }

    private PaymentEntity.PaymentStatus mapTinkoffStatus(String eventType) {
        return switch (eventType) {
            case "payment.confirmed" -> PaymentEntity.PaymentStatus.SUCCEEDED;
            case "payment.rejected" -> PaymentEntity.PaymentStatus.REJECTED;
            case "payment.canceled" -> PaymentEntity.PaymentStatus.CANCELED;
            default -> null;
        };
    }

    private PaymentEntity.PaymentStatus mapSberStatus(String eventType) {
        return switch (eventType) {
            case "payment.deposited" -> PaymentEntity.PaymentStatus.SUCCEEDED;
            case "payment.declined" -> PaymentEntity.PaymentStatus.REJECTED;
            case "payment.reversed" -> PaymentEntity.PaymentStatus.CANCELED;
            default -> null;
        };
    }

    private PaymentEntity.PaymentStatus mapYookassaStatus(String eventType) {
        return switch (eventType) {
            case "payment.succeeded" -> PaymentEntity.PaymentStatus.SUCCEEDED;
            case "payment.canceled" -> PaymentEntity.PaymentStatus.CANCELED;
            default -> null;
        };
    }
}