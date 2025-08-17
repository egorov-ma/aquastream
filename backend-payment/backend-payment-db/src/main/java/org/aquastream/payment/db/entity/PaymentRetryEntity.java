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
@Table(name = "payment_retries", schema = "payment")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRetryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "payment_id", nullable = false)
    private UUID paymentId;

    // Информация о попытке
    @Column(name = "retry_attempt", nullable = false)
    private Integer retryAttempt;

    @Column(name = "retry_type", nullable = false, length = 50)
    private String retryType;

    // Результат попытки
    @Column(name = "success", nullable = false)
    @Builder.Default
    private Boolean success = false;

    @Column(name = "error_code", length = 100)
    private String errorCode;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "response_data", columnDefinition = "jsonb")
    private Map<String, Object> responseData;

    // Временные метки
    @Column(name = "attempted_at", nullable = false)
    @Builder.Default
    private Instant attemptedAt = Instant.now();

    @Column(name = "next_retry_at")
    private Instant nextRetryAt;

    // Связь с платежом
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", insertable = false, updatable = false)
    private PaymentEntity payment;

    @PrePersist
    protected void onCreate() {
        if (attemptedAt == null) {
            attemptedAt = Instant.now();
        }
        if (success == null) {
            success = false;
        }
    }
}