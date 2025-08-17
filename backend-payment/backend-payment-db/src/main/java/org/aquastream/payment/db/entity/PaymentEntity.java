package org.aquastream.payment.db.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "payments", schema = "payment")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Связь с бизнес-объектами
    @Column(name = "event_id")
    private UUID eventId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    // Финансовая информация
    @Column(name = "amount_kopecks", nullable = false)
    private Long amountKopecks;

    @Column(name = "currency", nullable = false, length = 3)
    @Builder.Default
    private String currency = "RUB";

    // Статусы и обработка
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    // Идентификаторы провайдера
    @Column(name = "provider_name", nullable = false, length = 50)
    private String providerName;

    @Column(name = "provider_payment_id", length = 255)
    private String providerPaymentId;

    @Column(name = "idempotency_key", nullable = false, length = 255)
    private String idempotencyKey;

    // Описание и метаданные
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    // Временные метки
    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    // Аудит
    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "client_ip")
    private String clientIp;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    public enum PaymentStatus {
        PENDING,     // Создан, ожидает отправки провайдеру
        SUBMITTED,   // Отправлен провайдеру, ожидает обработки
        SUCCEEDED,   // Успешно завершен
        REJECTED,    // Отклонен провайдером
        CANCELED     // Отменен пользователем или системой
    }

    // Convenience methods
    public BigDecimal getAmountRubles() {
        return amountKopecks != null ? 
            BigDecimal.valueOf(amountKopecks).divide(BigDecimal.valueOf(100)) : 
            null;
    }

    public void setAmountRubles(BigDecimal amountRubles) {
        this.amountKopecks = amountRubles != null ? 
            amountRubles.multiply(BigDecimal.valueOf(100)).longValue() : 
            null;
    }

    public boolean isCompleted() {
        return status == PaymentStatus.SUCCEEDED || 
               status == PaymentStatus.REJECTED || 
               status == PaymentStatus.CANCELED;
    }

    public boolean isSuccessful() {
        return status == PaymentStatus.SUCCEEDED;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (updatedAt == null) {
            updatedAt = Instant.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
        
        // Автоматически устанавливаем completed_at при завершении
        if (isCompleted() && completedAt == null) {
            completedAt = Instant.now();
        }
        
        // Автоматически устанавливаем submitted_at при отправке
        if (status == PaymentStatus.SUBMITTED && submittedAt == null) {
            submittedAt = Instant.now();
        }
    }
}