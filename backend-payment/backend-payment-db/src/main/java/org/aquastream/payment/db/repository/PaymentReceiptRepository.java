package org.aquastream.payment.db.repository;

import org.aquastream.payment.db.entity.PaymentReceiptEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentReceiptRepository extends JpaRepository<PaymentReceiptEntity, UUID> {

    // Чеки по платежу
    List<PaymentReceiptEntity> findByPaymentIdOrderByCreatedAtDesc(UUID paymentId);

    // Чеки по статусу
    List<PaymentReceiptEntity> findByStatusOrderByCreatedAt(PaymentReceiptEntity.ReceiptStatus status);

    // Чеки требующие отправки в ОФД
    @Query("SELECT r FROM PaymentReceiptEntity r WHERE r.status = 'PENDING' ORDER BY r.createdAt")
    List<PaymentReceiptEntity> findReceiptsToSend();

    // Отправленные чеки без подтверждения регистрации
    @Query("SELECT r FROM PaymentReceiptEntity r WHERE r.status = 'SENT' AND r.sentAt <= :beforeTime ORDER BY r.sentAt")
    List<PaymentReceiptEntity> findSentReceiptsNeedingCheck(@Param("beforeTime") Instant beforeTime);

    // Поиск по номеру фискального документа
    Optional<PaymentReceiptEntity> findByFiscalDocumentNumber(String fiscalDocumentNumber);

    // Поиск по фискальному признаку
    Optional<PaymentReceiptEntity> findByFiscalSign(String fiscalSign);

    // Статистика чеков по типу
    @Query("SELECT r.receiptType, r.status, COUNT(r) FROM PaymentReceiptEntity r WHERE r.createdAt >= :fromDate GROUP BY r.receiptType, r.status")
    List<Object[]> getReceiptStatsByType(@Param("fromDate") Instant fromDate);

    // Количество необработанных чеков
    @Query("SELECT COUNT(r) FROM PaymentReceiptEntity r WHERE r.status IN ('PENDING', 'SENT')")
    Long countUnprocessedReceipts();

    // Чеки с ошибками
    List<PaymentReceiptEntity> findByStatusAndUpdatedAtBefore(PaymentReceiptEntity.ReceiptStatus status, Instant before);

    // Последний чек по платежу
    @Query("SELECT r FROM PaymentReceiptEntity r WHERE r.paymentId = :paymentId ORDER BY r.createdAt DESC LIMIT 1")
    Optional<PaymentReceiptEntity> findLastReceiptByPayment(@Param("paymentId") UUID paymentId);

    // Проверка существования успешного чека для платежа
    boolean existsByPaymentIdAndStatus(UUID paymentId, PaymentReceiptEntity.ReceiptStatus status);
}