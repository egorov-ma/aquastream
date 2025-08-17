package org.aquastream.crew.db.repository;

import org.aquastream.crew.db.entity.TentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TentRepository extends JpaRepository<TentEntity, UUID> {

    @Query("SELECT t FROM TentEntity t JOIN t.crew c WHERE c.eventId = :eventId ORDER BY t.createdAt")
    List<TentEntity> findByEventIdOrderByCreatedAt(@Param("eventId") UUID eventId);

    Optional<TentEntity> findByCrewId(UUID crewId);

    @Query("SELECT t FROM TentEntity t WHERE t.tentNumber = :tentNumber")
    Optional<TentEntity> findByTentNumber(@Param("tentNumber") String tentNumber);

    @Query("SELECT t FROM TentEntity t WHERE t.tentType = :tentType ORDER BY t.createdAt")
    List<TentEntity> findByTentTypeOrderByCreatedAt(@Param("tentType") String tentType);

    @Query("SELECT t FROM TentEntity t JOIN t.crew c WHERE c.eventId = :eventId AND t.tentType = :tentType ORDER BY t.createdAt")
    List<TentEntity> findByEventIdAndTentTypeOrderByCreatedAt(@Param("eventId") UUID eventId, @Param("tentType") String tentType);

    @Query("SELECT t FROM TentEntity t WHERE t.seasonRating = :seasonRating ORDER BY t.createdAt")
    List<TentEntity> findBySeasonRatingOrderByCreatedAt(@Param("seasonRating") TentEntity.SeasonRating seasonRating);

    @Query("SELECT t FROM TentEntity t WHERE t.condition = :condition ORDER BY t.createdAt")
    List<TentEntity> findByConditionOrderByCreatedAt(@Param("condition") TentEntity.Condition condition);

    @Query("SELECT COUNT(t) FROM TentEntity t JOIN t.crew c WHERE c.eventId = :eventId")
    long countByEventId(@Param("eventId") UUID eventId);
}