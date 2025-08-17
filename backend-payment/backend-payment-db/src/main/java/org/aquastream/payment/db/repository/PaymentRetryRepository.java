package org.aquastream.payment.db.repository;

import org.aquastream.payment.db.entity.PaymentRetryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentRetryRepository extends JpaRepository<PaymentRetryEntity, UUID> {

    // История retry по платежу
    List<PaymentRetryEntity> findByPaymentIdOrderByAttemptedAtDesc(UUID paymentId);

    // Retry попытки по типу
    List<PaymentRetryEntity> findByRetryTypeOrderByAttemptedAtDesc(String retryType);

    // Неудачные попытки требующие retry
    @Query("SELECT r FROM PaymentRetryEntity r WHERE r.success = false AND r.nextRetryAt IS NOT NULL AND r.nextRetryAt <= :now ORDER BY r.nextRetryAt")
    List<PaymentRetryEntity> findRetriesReadyForExecution(@Param("now") Instant now);

    // Последняя попытка по платежу и типу
    @Query("SELECT r FROM PaymentRetryEntity r WHERE r.paymentId = :paymentId AND r.retryType = :retryType ORDER BY r.attemptedAt DESC LIMIT 1")
    PaymentRetryEntity findLastRetryAttempt(@Param("paymentId") UUID paymentId, @Param("retryType") String retryType);

    // Количество попыток по платежу и типу
    @Query("SELECT COUNT(r) FROM PaymentRetryEntity r WHERE r.paymentId = :paymentId AND r.retryType = :retryType")
    Long countRetryAttempts(@Param("paymentId") UUID paymentId, @Param("retryType") String retryType);

    // Статистика успешности retry по типу
    @Query("SELECT r.retryType, r.success, COUNT(r) FROM PaymentRetryEntity r WHERE r.attemptedAt >= :fromDate GROUP BY r.retryType, r.success")
    List<Object[]> getRetrySuccessStatsByType(@Param("fromDate") Instant fromDate);

    // Платежи с превышением лимита retry
    @Query("SELECT r.paymentId, COUNT(r) FROM PaymentRetryEntity r WHERE r.retryType = :retryType AND r.success = false GROUP BY r.paymentId HAVING COUNT(r) >= :maxAttempts")
    List<Object[]> findPaymentsExceedingRetryLimit(@Param("retryType") String retryType, @Param("maxAttempts") Integer maxAttempts);

    // Старые записи retry для очистки
    List<PaymentRetryEntity> findByAttemptedAtBefore(Instant before);

    // Средняя длительность между retry попытками
    @Query("SELECT AVG(EXTRACT(EPOCH FROM (r2.attemptedAt - r1.attemptedAt))) FROM PaymentRetryEntity r1, PaymentRetryEntity r2 WHERE r1.paymentId = r2.paymentId AND r1.retryType = r2.retryType AND r2.retryAttempt = r1.retryAttempt + 1")
    Double getAverageRetryInterval();
}