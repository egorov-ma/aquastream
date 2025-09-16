package org.aquastream.event.db.repository;

import org.aquastream.event.db.entity.FavoritesEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for managing user favorites.
 */
@Repository
public interface FavoritesRepository extends JpaRepository<FavoritesEntity, FavoritesEntity.FavoritesId> {
    
    /**
     * Find all favorite events for a specific user.
     * Returns favorites ordered by creation date (most recent first).
     */
    @Query("SELECT f FROM FavoritesEntity f " +
           "LEFT JOIN FETCH f.event e " +
           "WHERE f.id.userId = :userId " +
           "ORDER BY f.createdAt DESC")
    List<FavoritesEntity> findByUserIdWithEvents(@Param("userId") UUID userId);
    
    /**
     * Find all user IDs who have favorited a specific event.
     * Useful for notifications when event details change.
     */
    @Query("SELECT f.id.userId FROM FavoritesEntity f WHERE f.id.eventId = :eventId")
    List<UUID> findUserIdsByEventId(@Param("eventId") UUID eventId);
    
    /**
     * Check if user has favorited a specific event.
     */
    boolean existsById_UserIdAndId_EventId(UUID userId, UUID eventId);
    
    /**
     * Count total favorites for a specific event.
     */
    @Query("SELECT COUNT(f) FROM FavoritesEntity f WHERE f.id.eventId = :eventId")
    Long countByEventId(@Param("eventId") UUID eventId);
    
    /**
     * Count total favorites by a specific user.
     */
    @Query("SELECT COUNT(f) FROM FavoritesEntity f WHERE f.id.userId = :userId")
    Long countByUserId(@Param("userId") UUID userId);
    
    /**
     * Remove favorite by user ID and event ID.
     * Returns number of deleted records (should be 0 or 1).
     */
    @Modifying
    @Query("DELETE FROM FavoritesEntity f WHERE f.id.userId = :userId AND f.id.eventId = :eventId")
    int deleteByUserIdAndEventId(@Param("userId") UUID userId, @Param("eventId") UUID eventId);
    
    /**
     * Remove all favorites for a specific event.
     * Used when event is deleted or cancelled.
     */
    @Modifying
    @Query("DELETE FROM FavoritesEntity f WHERE f.id.eventId = :eventId")
    int deleteByEventId(@Param("eventId") UUID eventId);
    
    /**
     * Remove all favorites for a specific user.
     * Used when user account is deleted.
     */
    @Modifying
    @Query("DELETE FROM FavoritesEntity f WHERE f.id.userId = :userId")
    int deleteByUserId(@Param("userId") UUID userId);
    
    /**
     * Find events that are favorited by multiple users (popular events).
     * Returns event IDs ordered by favorites count (most popular first).
     */
    @Query("SELECT f.id.eventId, COUNT(f) as favCount FROM FavoritesEntity f " +
           "GROUP BY f.id.eventId " +
           "HAVING COUNT(f) >= :minFavorites " +
           "ORDER BY favCount DESC")
    List<Object[]> findPopularEvents(@Param("minFavorites") Long minFavorites);
}