package org.aquastream.payment.db.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "webhook_events", schema = "payment")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebhookEventEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Идентификация события
    @Column(name = "provider_name", nullable = false, length = 50)
    private String providerName;

    @Column(name = "provider_event_id", nullable = false, length = 255)
    private String providerEventId;

    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    // Связь с платежом
    @Column(name = "payment_id")
    private UUID paymentId;

    @Column(name = "provider_payment_id", length = 255)
    private String providerPaymentId;

    // Содержимое вебхука
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_payload", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> rawPayload;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "processed_payload", columnDefinition = "jsonb")
    private Map<String, Object> processedPayload;

    // Статус обработки
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private WebhookStatus status = WebhookStatus.PENDING;

    @Column(name = "processing_attempts", nullable = false)
    @Builder.Default
    private Integer processingAttempts = 0;

    @Column(name = "last_error", columnDefinition = "TEXT")
    private String lastError;

    // Идемпотентность
    @Column(name = "idempotency_key", nullable = false, length = 255)
    private String idempotencyKey;

    // Временные метки
    @Column(name = "received_at", nullable = false)
    @Builder.Default
    private Instant receivedAt = Instant.now();

    @Column(name = "processed_at")
    private Instant processedAt;

    // HTTP контекст
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "http_headers", columnDefinition = "jsonb")
    private Map<String, String> httpHeaders;

    @Column(name = "source_ip")
    private String sourceIp;

    // Связь с платежом
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", insertable = false, updatable = false)
    private PaymentEntity payment;

    public enum WebhookStatus {
        PENDING,     // Получен, ожидает обработки
        PROCESSED,   // Успешно обработан
        FAILED,      // Ошибка обработки
        IGNORED      // Проигнорирован (например, дубликат или неизвестный тип)
    }

    // Convenience methods
    public boolean isProcessed() {
        return status == WebhookStatus.PROCESSED;
    }

    public boolean isFailed() {
        return status == WebhookStatus.FAILED;
    }

    public boolean needsProcessing() {
        return status == WebhookStatus.PENDING || status == WebhookStatus.FAILED;
    }

    public void incrementProcessingAttempts() {
        this.processingAttempts = (this.processingAttempts != null ? this.processingAttempts : 0) + 1;
    }

    @PrePersist
    protected void onCreate() {
        if (receivedAt == null) {
            receivedAt = Instant.now();
        }
        if (processingAttempts == null) {
            processingAttempts = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        // Автоматически устанавливаем processed_at при завершении обработки
        if ((status == WebhookStatus.PROCESSED || status == WebhookStatus.IGNORED) && processedAt == null) {
            processedAt = Instant.now();
        }
    }
}