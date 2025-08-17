package org.aquastream.payment.db.repository;

import org.aquastream.payment.db.entity.PaymentStatusLogEntity;
import org.aquastream.payment.db.entity.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentStatusLogRepository extends JpaRepository<PaymentStatusLogEntity, UUID> {

    // История изменений по платежу
    List<PaymentStatusLogEntity> findByPaymentIdOrderByChangedAtDesc(UUID paymentId);

    // История изменений за период
    List<PaymentStatusLogEntity> findByChangedAtBetweenOrderByChangedAtDesc(Instant from, Instant to);

    // Изменения определенного статуса
    List<PaymentStatusLogEntity> findByNewStatusOrderByChangedAtDesc(PaymentEntity.PaymentStatus status);

    // Изменения по причине
    List<PaymentStatusLogEntity> findByReasonOrderByChangedAtDesc(String reason);

    // Изменения через вебхуки
    @Query("SELECT l FROM PaymentStatusLogEntity l WHERE l.webhookEventId IS NOT NULL ORDER BY l.changedAt DESC")
    List<PaymentStatusLogEntity> findWebhookTriggeredChanges();

    // Статистика переходов статусов
    @Query("SELECT l.oldStatus, l.newStatus, COUNT(l) FROM PaymentStatusLogEntity l WHERE l.changedAt >= :fromDate GROUP BY l.oldStatus, l.newStatus")
    List<Object[]> getStatusTransitionStats(@Param("fromDate") Instant fromDate);

    // Частота изменений статусов по платежу (для выявления проблемных платежей)
    @Query("SELECT l.paymentId, COUNT(l) FROM PaymentStatusLogEntity l GROUP BY l.paymentId HAVING COUNT(l) > :threshold ORDER BY COUNT(l) DESC")
    List<Object[]> findPaymentsWithFrequentStatusChanges(@Param("threshold") Long threshold);

    // Старые записи для очистки
    List<PaymentStatusLogEntity> findByChangedAtBefore(Instant before);
}