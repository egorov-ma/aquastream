package org.aquastream.payment.db.repository;

import org.aquastream.payment.db.entity.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, UUID> {

    // Поиск по идемпотентности
    Optional<PaymentEntity> findByProviderNameAndIdempotencyKey(String providerName, String idempotencyKey);

    // Поиск по провайдеру и ID платежа
    Optional<PaymentEntity> findByProviderNameAndProviderPaymentId(String providerName, String providerPaymentId);

    // Платежи пользователя
    List<PaymentEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);

    // Платежи по событию
    List<PaymentEntity> findByEventIdOrderByCreatedAtDesc(UUID eventId);

    // Платежи по статусу
    List<PaymentEntity> findByStatusOrderByCreatedAt(PaymentEntity.PaymentStatus status);

    // Платежи пользователя по статусу
    List<PaymentEntity> findByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, PaymentEntity.PaymentStatus status);

    // Платежи события по статусу
    List<PaymentEntity> findByEventIdAndStatusOrderByCreatedAtDesc(UUID eventId, PaymentEntity.PaymentStatus status);

    // Просроченные платежи для cleanup
    @Query("SELECT p FROM PaymentEntity p WHERE p.expiresAt IS NOT NULL AND p.expiresAt <= :now AND p.status IN ('PENDING', 'SUBMITTED')")
    List<PaymentEntity> findExpiredPayments(@Param("now") Instant now);

    // Статистика по провайдеру
    @Query("SELECT p.providerName, p.status, COUNT(p) FROM PaymentEntity p WHERE p.createdAt >= :fromDate GROUP BY p.providerName, p.status")
    List<Object[]> getPaymentStatsByProvider(@Param("fromDate") Instant fromDate);

    // Платежи требующие retry
    @Query("SELECT p FROM PaymentEntity p WHERE p.status = 'SUBMITTED' AND p.submittedAt <= :beforeTime")
    List<PaymentEntity> findPaymentsNeedingStatusCheck(@Param("beforeTime") Instant beforeTime);

    // Общая сумма успешных платежей пользователя
    @Query("SELECT COALESCE(SUM(p.amountKopecks), 0) FROM PaymentEntity p WHERE p.userId = :userId AND p.status = 'SUCCEEDED'")
    Long getTotalSuccessfulAmountByUser(@Param("userId") UUID userId);

    // Общая сумма успешных платежей по событию
    @Query("SELECT COALESCE(SUM(p.amountKopecks), 0) FROM PaymentEntity p WHERE p.eventId = :eventId AND p.status = 'SUCCEEDED'")
    Long getTotalSuccessfulAmountByEvent(@Param("eventId") UUID eventId);

    // Количество успешных платежей пользователя
    @Query("SELECT COUNT(p) FROM PaymentEntity p WHERE p.userId = :userId AND p.status = 'SUCCEEDED'")
    Long getSuccessfulPaymentCountByUser(@Param("userId") UUID userId);

    // Последний успешный платеж пользователя
    @Query("SELECT p FROM PaymentEntity p WHERE p.userId = :userId AND p.status = 'SUCCEEDED' ORDER BY p.completedAt DESC LIMIT 1")
    Optional<PaymentEntity> findLastSuccessfulPaymentByUser(@Param("userId") UUID userId);

    // Проверка существования успешного платежа за событие от пользователя
    boolean existsByUserIdAndEventIdAndStatus(UUID userId, UUID eventId, PaymentEntity.PaymentStatus status);

    // Платежи в процессе обработки (для мониторинга)
    @Query("SELECT p FROM PaymentEntity p WHERE p.status IN ('PENDING', 'SUBMITTED') ORDER BY p.createdAt")
    List<PaymentEntity> findActivePayments();

    // Поиск дублирующих платежей (по пользователю, событию и сумме)
    @Query("SELECT p FROM PaymentEntity p WHERE p.userId = :userId AND p.eventId = :eventId AND p.amountKopecks = :amount AND p.status IN ('PENDING', 'SUBMITTED', 'SUCCEEDED')")
    List<PaymentEntity> findPotentialDuplicates(@Param("userId") UUID userId, @Param("eventId") UUID eventId, @Param("amount") Long amount);
}