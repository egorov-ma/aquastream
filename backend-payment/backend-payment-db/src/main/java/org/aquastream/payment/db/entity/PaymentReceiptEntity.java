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
@Table(name = "payment_receipts", schema = "payment")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentReceiptEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "payment_id", nullable = false)
    private UUID paymentId;

    // Тип и содержимое чека
    @Enumerated(EnumType.STRING)
    @Column(name = "receipt_type", nullable = false)
    private ReceiptType receiptType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "receipt_data", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> receiptData;

    // Информация о фискализации
    @Column(name = "fiscal_receipt_number", length = 255)
    private String fiscalReceiptNumber;

    @Column(name = "fiscal_document_number", length = 255)
    private String fiscalDocumentNumber;

    @Column(name = "fiscal_sign", length = 255)
    private String fiscalSign;

    @Column(name = "ofd_receipt_url", columnDefinition = "TEXT")
    private String ofdReceiptUrl;

    // Статус обработки чека
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ReceiptStatus status = ReceiptStatus.PENDING;

    // Временные метки
    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @Column(name = "sent_at")
    private Instant sentAt;

    @Column(name = "registered_at")
    private Instant registeredAt;

    // Связь с платежом
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", insertable = false, updatable = false)
    private PaymentEntity payment;

    public enum ReceiptType {
        PAYMENT,      // Чек за платеж
        REFUND,       // Чек возврата
        CORRECTION    // Чек коррекции
    }

    public enum ReceiptStatus {
        PENDING,      // Ожидает отправки в ОФД
        SENT,         // Отправлен в ОФД
        REGISTERED,   // Зарегистрирован в ОФД
        FAILED        // Ошибка фискализации
    }

    // Convenience methods
    public boolean isProcessed() {
        return status == ReceiptStatus.REGISTERED;
    }

    public boolean isFailed() {
        return status == ReceiptStatus.FAILED;
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
        
        // Автоматически устанавливаем sent_at при отправке
        if (status == ReceiptStatus.SENT && sentAt == null) {
            sentAt = Instant.now();
        }
        
        // Автоматически устанавливаем registered_at при регистрации
        if (status == ReceiptStatus.REGISTERED && registeredAt == null) {
            registeredAt = Instant.now();
        }
    }
}