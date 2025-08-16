package org.aquastream.event.db.repository;

import org.aquastream.event.db.entity.TeamMemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TeamMemberRepository extends JpaRepository<TeamMemberEntity, UUID> {

    @Query("SELECT tm FROM TeamMemberEntity tm " +
           "WHERE tm.organizer.slug = :organizerSlug " +
           "ORDER BY tm.sortOrder ASC, tm.createdAt ASC")
    List<TeamMemberEntity> findByOrganizerSlugOrderBySortOrder(@Param("organizerSlug") String organizerSlug);

    List<TeamMemberEntity> findByOrganizerIdOrderBySortOrderAscCreatedAtAsc(UUID organizerId);
}