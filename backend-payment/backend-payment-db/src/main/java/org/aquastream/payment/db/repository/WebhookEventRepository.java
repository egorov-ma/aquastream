package org.aquastream.payment.db.repository;

import org.aquastream.payment.db.entity.WebhookEventEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WebhookEventRepository extends JpaRepository<WebhookEventEntity, UUID> {

    // Поиск по идемпотентности (АС: дубликаты вебхуков ловятся на уровне БД)
    Optional<WebhookEventEntity> findByIdempotencyKey(String idempotencyKey);

    // Поиск по провайдеру и ID события
    Optional<WebhookEventEntity> findByProviderNameAndProviderEventId(String providerName, String providerEventId);

    // Поиск по платежу
    List<WebhookEventEntity> findByPaymentIdOrderByReceivedAtDesc(UUID paymentId);

    // Поиск по ID платежа провайдера (для связывания до создания payment)
    List<WebhookEventEntity> findByProviderNameAndProviderPaymentIdOrderByReceivedAtDesc(String providerName, String providerPaymentId);

    // Вебхуки требующие обработки
    List<WebhookEventEntity> findByStatusOrderByReceivedAt(WebhookEventEntity.WebhookStatus status);

    // Вебхуки с ошибками обработки
    @Query("SELECT w FROM WebhookEventEntity w WHERE w.status = 'FAILED' AND w.processingAttempts < :maxAttempts ORDER BY w.receivedAt")
    List<WebhookEventEntity> findFailedWebhooksForRetry(@Param("maxAttempts") Integer maxAttempts);

    // Статистика вебхуков по провайдеру
    @Query("SELECT w.providerName, w.eventType, w.status, COUNT(w) FROM WebhookEventEntity w WHERE w.receivedAt >= :fromDate GROUP BY w.providerName, w.eventType, w.status")
    List<Object[]> getWebhookStatsByProvider(@Param("fromDate") Instant fromDate);

    // Вебхуки без связанного платежа
    @Query("SELECT w FROM WebhookEventEntity w WHERE w.paymentId IS NULL AND w.providerPaymentId IS NOT NULL ORDER BY w.receivedAt")
    List<WebhookEventEntity> findOrphanedWebhooks();

    // Старые обработанные вебхуки для очистки
    @Query("SELECT w FROM WebhookEventEntity w WHERE w.status = 'PROCESSED' AND w.processedAt <= :beforeDate")
    List<WebhookEventEntity> findOldProcessedWebhooks(@Param("beforeDate") Instant beforeDate);

    // Поиск по типу события
    List<WebhookEventEntity> findByEventTypeOrderByReceivedAtDesc(String eventType);

    // Поиск по провайдеру
    List<WebhookEventEntity> findByProviderNameOrderByReceivedAtDesc(String providerName);

    // Последние вебхуки по провайдеру
    @Query("SELECT w FROM WebhookEventEntity w WHERE w.providerName = :providerName ORDER BY w.receivedAt DESC LIMIT :limit")
    List<WebhookEventEntity> findRecentWebhooksByProvider(@Param("providerName") String providerName, @Param("limit") Integer limit);

    // Проверка существования вебхука для предотвращения дублей
    boolean existsByProviderNameAndProviderEventId(String providerName, String providerEventId);

    // Количество необработанных вебхуков
    @Query("SELECT COUNT(w) FROM WebhookEventEntity w WHERE w.status IN ('PENDING', 'FAILED')")
    Long countUnprocessedWebhooks();

    // Средний размер очереди обработки по провайдерам
    @Query("SELECT w.providerName, COUNT(w) FROM WebhookEventEntity w WHERE w.status = 'PENDING' GROUP BY w.providerName")
    List<Object[]> getPendingWebhookCountByProvider();
}