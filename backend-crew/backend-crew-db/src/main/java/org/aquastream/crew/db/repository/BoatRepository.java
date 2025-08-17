package org.aquastream.crew.db.repository;

import org.aquastream.crew.db.entity.BoatEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BoatRepository extends JpaRepository<BoatEntity, UUID> {

    @Query("SELECT b FROM BoatEntity b JOIN b.crew c WHERE c.eventId = :eventId ORDER BY b.createdAt")
    List<BoatEntity> findByEventIdOrderByCreatedAt(@Param("eventId") UUID eventId);

    Optional<BoatEntity> findByCrewId(UUID crewId);

    @Query("SELECT b FROM BoatEntity b WHERE b.boatNumber = :boatNumber")
    Optional<BoatEntity> findByBoatNumber(@Param("boatNumber") String boatNumber);

    @Query("SELECT b FROM BoatEntity b WHERE b.boatType = :boatType ORDER BY b.createdAt")
    List<BoatEntity> findByBoatTypeOrderByCreatedAt(@Param("boatType") String boatType);

    @Query("SELECT b FROM BoatEntity b JOIN b.crew c WHERE c.eventId = :eventId AND b.boatType = :boatType ORDER BY b.createdAt")
    List<BoatEntity> findByEventIdAndBoatTypeOrderByCreatedAt(@Param("eventId") UUID eventId, @Param("boatType") String boatType);

    @Query("SELECT b FROM BoatEntity b WHERE b.condition = :condition ORDER BY b.createdAt")
    List<BoatEntity> findByConditionOrderByCreatedAt(@Param("condition") BoatEntity.Condition condition);

    @Query("SELECT COUNT(b) FROM BoatEntity b JOIN b.crew c WHERE c.eventId = :eventId")
    long countByEventId(@Param("eventId") UUID eventId);
}