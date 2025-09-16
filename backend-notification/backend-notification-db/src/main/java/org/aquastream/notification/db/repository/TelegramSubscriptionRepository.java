package org.aquastream.notification.db.repository;

import org.aquastream.notification.db.entity.TelegramSubscriptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TelegramSubscriptionRepository extends JpaRepository<TelegramSubscriptionEntity, UUID> {

    /**
     * Find active subscription by user ID
     */
    @Query("SELECT ts FROM TelegramSubscriptionEntity ts WHERE ts.userId = :userId AND ts.isActive = true")
    Optional<TelegramSubscriptionEntity> findActiveByUserId(@Param("userId") UUID userId);

    /**
     * Find subscription by user ID (regardless of active status)
     */
    Optional<TelegramSubscriptionEntity> findByUserId(UUID userId);

    /**
     * Find subscription by Telegram chat ID
     */
    Optional<TelegramSubscriptionEntity> findByTelegramChatId(Long telegramChatId);

    /**
     * Find subscription by Telegram user ID
     */
    Optional<TelegramSubscriptionEntity> findByTelegramUserId(Long telegramUserId);

    /**
     * Find subscription by link code (for verification)
     */
    @Query("SELECT ts FROM TelegramSubscriptionEntity ts WHERE ts.linkCode = :linkCode AND ts.linkExpiresAt > :now")
    Optional<TelegramSubscriptionEntity> findByValidLinkCode(@Param("linkCode") String linkCode, @Param("now") Instant now);

    /**
     * Find subscription by link code (including expired)
     */
    Optional<TelegramSubscriptionEntity> findByLinkCode(String linkCode);

    /**
     * Find verified subscriptions by user ID
     */
    @Query("SELECT ts FROM TelegramSubscriptionEntity ts WHERE ts.userId = :userId AND ts.isActive = true AND ts.verifiedAt IS NOT NULL")
    List<TelegramSubscriptionEntity> findByUserIdAndVerified(@Param("userId") UUID userId);

    /**
     * Find all verified and active subscriptions
     */
    @Query("SELECT ts FROM TelegramSubscriptionEntity ts WHERE ts.isActive = true AND ts.verifiedAt IS NOT NULL")
    List<TelegramSubscriptionEntity> findAllActiveAndVerified();

    /**
     * Find all subscriptions that can receive messages
     */
    @Query("SELECT ts FROM TelegramSubscriptionEntity ts WHERE ts.isActive = true AND ts.verifiedAt IS NOT NULL")
    List<TelegramSubscriptionEntity> findAllCanReceiveMessages();

    /**
     * Find unverified subscriptions (for cleanup)
     */
    @Query("SELECT ts FROM TelegramSubscriptionEntity ts WHERE ts.verifiedAt IS NULL")
    List<TelegramSubscriptionEntity> findUnverified();

    /**
     * Find expired link codes (for cleanup)
     */
    @Query("SELECT ts FROM TelegramSubscriptionEntity ts WHERE ts.linkCode IS NOT NULL AND ts.linkExpiresAt < :now")
    List<TelegramSubscriptionEntity> findExpiredLinkCodes(@Param("now") Instant now);

    /**
     * Find subscriptions by Telegram username
     */
    @Query("SELECT ts FROM TelegramSubscriptionEntity ts WHERE ts.telegramUsername = :username AND ts.isActive = true")
    List<TelegramSubscriptionEntity> findByTelegramUsername(@Param("username") String username);

    /**
     * Check if Telegram chat ID is already linked to any user
     */
    boolean existsByTelegramChatId(Long telegramChatId);

    /**
     * Check if Telegram user ID is already linked to any user
     */
    boolean existsByTelegramUserId(Long telegramUserId);

    /**
     * Check if user has active Telegram subscription
     */
    @Query("SELECT CASE WHEN COUNT(ts) > 0 THEN true ELSE false END FROM TelegramSubscriptionEntity ts WHERE ts.userId = :userId AND ts.isActive = true AND ts.verifiedAt IS NOT NULL")
    boolean hasActiveSubscription(@Param("userId") UUID userId);

    /**
     * Get chat ID for user (for sending messages)
     */
    @Query("SELECT ts.telegramChatId FROM TelegramSubscriptionEntity ts WHERE ts.userId = :userId AND ts.isActive = true AND ts.verifiedAt IS NOT NULL")
    Optional<Long> getChatIdByUserId(@Param("userId") UUID userId);

    /**
     * Count verified subscriptions (for analytics)
     */
    @Query("SELECT COUNT(ts) FROM TelegramSubscriptionEntity ts WHERE ts.verifiedAt IS NOT NULL")
    long countVerified();

    /**
     * Count active subscriptions (for analytics)
     */
    @Query("SELECT COUNT(ts) FROM TelegramSubscriptionEntity ts WHERE ts.isActive = true")
    long countActive();

    /**
     * Delete subscription by user ID
     */
    void deleteByUserId(UUID userId);

    /**
     * Deactivate subscription by user ID
     */
    @Query("UPDATE TelegramSubscriptionEntity ts SET ts.isActive = false WHERE ts.userId = :userId")
    void deactivateByUserId(@Param("userId") UUID userId);
}