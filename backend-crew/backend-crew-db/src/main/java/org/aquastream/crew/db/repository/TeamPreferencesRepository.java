package org.aquastream.crew.db.repository;

import org.aquastream.crew.db.entity.TeamPreferencesEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamPreferencesRepository extends JpaRepository<TeamPreferencesEntity, UUID> {

    Optional<TeamPreferencesEntity> findByUserIdAndEventId(UUID userId, UUID eventId);

    List<TeamPreferencesEntity> findByEventIdOrderByCreatedAt(UUID eventId);

    @Query("SELECT tp FROM TeamPreferencesEntity tp WHERE tp.eventId = :eventId AND :userId = ANY(tp.prefersWithUserIds)")
    List<TeamPreferencesEntity> findByEventIdAndPrefersWithUser(@Param("eventId") UUID eventId, @Param("userId") UUID userId);

    @Query("SELECT tp FROM TeamPreferencesEntity tp WHERE tp.eventId = :eventId AND :userId = ANY(tp.avoidsUserIds)")
    List<TeamPreferencesEntity> findByEventIdAndAvoidsUser(@Param("eventId") UUID eventId, @Param("userId") UUID userId);

    @Query("SELECT tp FROM TeamPreferencesEntity tp WHERE tp.eventId = :eventId AND :crewType = ANY(tp.preferredCrewTypes)")
    List<TeamPreferencesEntity> findByEventIdAndPreferredCrewType(@Param("eventId") UUID eventId, @Param("crewType") String crewType);

    @Query("SELECT tp FROM TeamPreferencesEntity tp WHERE tp.eventId = :eventId AND :position = ANY(tp.preferredPositions)")
    List<TeamPreferencesEntity> findByEventIdAndPreferredPosition(@Param("eventId") UUID eventId, @Param("position") String position);

    @Query("SELECT COUNT(tp) FROM TeamPreferencesEntity tp WHERE tp.eventId = :eventId")
    long countByEventId(@Param("eventId") UUID eventId);

    void deleteByUserIdAndEventId(UUID userId, UUID eventId);
}