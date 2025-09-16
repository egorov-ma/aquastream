package org.aquastream.notification.db.repository;

import org.aquastream.notification.db.entity.NotificationPrefsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationPrefsRepository extends JpaRepository<NotificationPrefsEntity, NotificationPrefsEntity.NotificationPrefsId> {

    /**
     * Find all preferences for a specific user
     */
    @Query("SELECT np FROM NotificationPrefsEntity np WHERE np.id.userId = :userId")
    List<NotificationPrefsEntity> findByUserId(@Param("userId") UUID userId);

    /**
     * Find preferences for a specific user and category
     */
    @Query("SELECT np FROM NotificationPrefsEntity np WHERE np.id.userId = :userId AND np.id.category = :category")
    List<NotificationPrefsEntity> findByUserIdAndCategory(
            @Param("userId") UUID userId, 
            @Param("category") NotificationPrefsEntity.NotificationCategory category);

    /**
     * Find specific preference by user, category and channel
     */
    @Query("SELECT np FROM NotificationPrefsEntity np WHERE np.id.userId = :userId AND np.id.category = :category AND np.id.channel = :channel")
    Optional<NotificationPrefsEntity> findByUserIdAndCategoryAndChannel(
            @Param("userId") UUID userId,
            @Param("category") NotificationPrefsEntity.NotificationCategory category,
            @Param("channel") NotificationPrefsEntity.NotificationChannel channel);

    /**
     * Find all enabled preferences for a user and category
     */
    @Query("SELECT np FROM NotificationPrefsEntity np WHERE np.id.userId = :userId AND np.id.category = :category AND np.enabled = true")
    List<NotificationPrefsEntity> findEnabledByUserIdAndCategory(
            @Param("userId") UUID userId, 
            @Param("category") NotificationPrefsEntity.NotificationCategory category);

    /**
     * Find all enabled preferences for a user and channel
     */
    @Query("SELECT np FROM NotificationPrefsEntity np WHERE np.id.userId = :userId AND np.id.channel = :channel AND np.enabled = true")
    List<NotificationPrefsEntity> findEnabledByUserIdAndChannel(
            @Param("userId") UUID userId, 
            @Param("channel") NotificationPrefsEntity.NotificationChannel channel);

    /**
     * Check if user has enabled notifications for category and channel
     */
    @Query("SELECT np.enabled FROM NotificationPrefsEntity np WHERE np.id.userId = :userId AND np.id.category = :category AND np.id.channel = :channel")
    Optional<Boolean> isEnabledForUserCategoryAndChannel(
            @Param("userId") UUID userId,
            @Param("category") NotificationPrefsEntity.NotificationCategory category,
            @Param("channel") NotificationPrefsEntity.NotificationChannel channel);

    /**
     * Find all users who have enabled notifications for a specific category and channel
     * Useful for broadcast notifications
     */
    @Query("SELECT np.id.userId FROM NotificationPrefsEntity np WHERE np.id.category = :category AND np.id.channel = :channel AND np.enabled = true")
    List<UUID> findEnabledUserIds(
            @Param("category") NotificationPrefsEntity.NotificationCategory category,
            @Param("channel") NotificationPrefsEntity.NotificationChannel channel);

    /**
     * Count enabled preferences by category (for analytics)
     */
    @Query("SELECT COUNT(np) FROM NotificationPrefsEntity np WHERE np.id.category = :category AND np.enabled = true")
    long countEnabledByCategory(@Param("category") NotificationPrefsEntity.NotificationCategory category);

    /**
     * Count enabled preferences by channel (for analytics)
     */
    @Query("SELECT COUNT(np) FROM NotificationPrefsEntity np WHERE np.id.channel = :channel AND np.enabled = true")
    long countEnabledByChannel(@Param("channel") NotificationPrefsEntity.NotificationChannel channel);

    /**
     * Delete all preferences for a user (for user deletion)
     */
    @Query("DELETE FROM NotificationPrefsEntity np WHERE np.id.userId = :userId")
    void deleteByUserId(@Param("userId") UUID userId);
}