package org.aquastream.crew.db.repository;

import org.aquastream.crew.db.entity.CrewAssignmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CrewAssignmentRepository extends JpaRepository<CrewAssignmentEntity, UUID> {

    List<CrewAssignmentEntity> findByCrewIdAndStatusOrderByAssignedAt(UUID crewId, CrewAssignmentEntity.AssignmentStatus status);

    List<CrewAssignmentEntity> findByUserIdAndStatusOrderByAssignedAt(UUID userId, CrewAssignmentEntity.AssignmentStatus status);

    Optional<CrewAssignmentEntity> findByBookingIdAndStatus(UUID bookingId, CrewAssignmentEntity.AssignmentStatus status);

    @Query("SELECT ca FROM CrewAssignmentEntity ca JOIN ca.crew c WHERE c.eventId = :eventId AND ca.userId = :userId AND ca.status = :status")
    Optional<CrewAssignmentEntity> findByEventIdAndUserIdAndStatus(@Param("eventId") UUID eventId, @Param("userId") UUID userId, @Param("status") CrewAssignmentEntity.AssignmentStatus status);

    @Query("SELECT ca FROM CrewAssignmentEntity ca JOIN ca.crew c WHERE c.eventId = :eventId AND ca.status = :status ORDER BY ca.assignedAt")
    List<CrewAssignmentEntity> findByEventIdAndStatusOrderByAssignedAt(@Param("eventId") UUID eventId, @Param("status") CrewAssignmentEntity.AssignmentStatus status);

    @Query("SELECT COUNT(ca) FROM CrewAssignmentEntity ca WHERE ca.crew.id = :crewId AND ca.status = :status")
    long countByCrewIdAndStatus(@Param("crewId") UUID crewId, @Param("status") CrewAssignmentEntity.AssignmentStatus status);

    @Query("SELECT ca FROM CrewAssignmentEntity ca WHERE ca.crew.id = :crewId AND ca.seatNumber = :seatNumber AND ca.status = :status")
    Optional<CrewAssignmentEntity> findByCrewIdAndSeatNumberAndStatus(@Param("crewId") UUID crewId, @Param("seatNumber") Integer seatNumber, @Param("status") CrewAssignmentEntity.AssignmentStatus status);

    @Query("SELECT DISTINCT ca.seatNumber FROM CrewAssignmentEntity ca WHERE ca.crew.id = :crewId AND ca.status = :status AND ca.seatNumber IS NOT NULL ORDER BY ca.seatNumber")
    List<Integer> findOccupiedSeatNumbers(@Param("crewId") UUID crewId, @Param("status") CrewAssignmentEntity.AssignmentStatus status);
}