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
@Table(name = "payment_status_log", schema = "payment")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentStatusLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "payment_id", nullable = false)
    private UUID paymentId;

    // Переход статуса
    @Enumerated(EnumType.STRING)
    @Column(name = "old_status")
    private PaymentEntity.PaymentStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false)
    private PaymentEntity.PaymentStatus newStatus;

    // Причина изменения
    @Column(name = "reason", length = 100)
    private String reason;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "details", columnDefinition = "jsonb")
    private Map<String, Object> details;

    // Кто изменил
    @Column(name = "changed_by")
    private UUID changedBy;

    @Column(name = "webhook_event_id")
    private UUID webhookEventId;

    // Временная метка
    @Column(name = "changed_at", nullable = false)
    @Builder.Default
    private Instant changedAt = Instant.now();

    // Связи
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", insertable = false, updatable = false)
    private PaymentEntity payment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "webhook_event_id", insertable = false, updatable = false)
    private WebhookEventEntity webhookEvent;

    @PrePersist
    protected void onCreate() {
        if (changedAt == null) {
            changedAt = Instant.now();
        }
    }
}