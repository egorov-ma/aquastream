package org.aquastream.crew.db.repository;

import org.aquastream.crew.db.entity.CrewEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CrewRepository extends JpaRepository<CrewEntity, UUID> {

    List<CrewEntity> findByEventIdOrderByCreatedAt(UUID eventId);

    List<CrewEntity> findByEventIdAndTypeOrderByCreatedAt(UUID eventId, CrewEntity.CrewType type);

    Optional<CrewEntity> findByEventIdAndName(UUID eventId, String name);

    @Query("SELECT c FROM CrewEntity c WHERE c.eventId = :eventId AND c.currentSize < c.capacity")
    List<CrewEntity> findAvailableCrews(@Param("eventId") UUID eventId);

    @Query("SELECT c FROM CrewEntity c WHERE c.eventId = :eventId AND c.type = :type AND c.currentSize < c.capacity")
    List<CrewEntity> findAvailableCrewsByType(@Param("eventId") UUID eventId, @Param("type") CrewEntity.CrewType type);

    @Query("SELECT c FROM CrewEntity c WHERE c.eventId = :eventId AND c.currentSize >= c.capacity")
    List<CrewEntity> findFullCrews(@Param("eventId") UUID eventId);

    @Query("SELECT COUNT(c) FROM CrewEntity c WHERE c.eventId = :eventId")
    long countByEventId(@Param("eventId") UUID eventId);

    @Query("SELECT COUNT(c) FROM CrewEntity c WHERE c.eventId = :eventId AND c.type = :type")
    long countByEventIdAndType(@Param("eventId") UUID eventId, @Param("type") CrewEntity.CrewType type);
}