package org.aquastream.event.db.repository;

import org.aquastream.event.db.entity.OrganizerEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface OrganizerRepository extends JpaRepository<OrganizerEntity, UUID> {

    Optional<OrganizerEntity> findBySlug(String slug);

    @Query("SELECT o FROM OrganizerEntity o " +
           "WHERE (:search IS NULL OR " +
           "LOWER(o.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<OrganizerEntity> findBySearchTerm(@Param("search") String search, Pageable pageable);

    boolean existsBySlug(String slug);
}