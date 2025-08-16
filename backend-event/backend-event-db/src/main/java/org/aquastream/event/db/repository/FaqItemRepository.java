package org.aquastream.event.db.repository;

import org.aquastream.event.db.entity.FaqItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface FaqItemRepository extends JpaRepository<FaqItemEntity, UUID> {

    @Query("SELECT f FROM FaqItemEntity f " +
           "WHERE f.organizer.slug = :organizerSlug " +
           "ORDER BY f.sortOrder ASC, f.createdAt ASC")
    List<FaqItemEntity> findByOrganizerSlugOrderBySortOrder(@Param("organizerSlug") String organizerSlug);

    List<FaqItemEntity> findByOrganizerIdOrderBySortOrderAscCreatedAtAsc(UUID organizerId);
}