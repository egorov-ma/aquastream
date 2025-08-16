package org.aquastream.event.db.repository;

import org.aquastream.event.db.entity.EventEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface EventRepository extends JpaRepository<EventEntity, UUID> {

    @Query("SELECT e FROM EventEntity e " +
           "WHERE e.organizer.slug = :organizerSlug " +
           "AND (:status IS NULL OR e.status = :status) " +
           "AND (:type IS NULL OR e.type = :type) " +
           "AND (:minPrice IS NULL OR e.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR e.price <= :maxPrice) " +
           "AND (:dateFrom IS NULL OR e.dateStart >= :dateFrom) " +
           "AND (:dateTo IS NULL OR e.dateStart <= :dateTo)")
    Page<EventEntity> findByOrganizerSlugWithFilters(
            @Param("organizerSlug") String organizerSlug,
            @Param("status") String status,
            @Param("type") String type,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("dateFrom") Instant dateFrom,
            @Param("dateTo") Instant dateTo,
            Pageable pageable
    );

    @Query("SELECT e FROM EventEntity e " +
           "WHERE (:status IS NULL OR e.status = :status) " +
           "AND (:type IS NULL OR e.type = :type) " +
           "AND (:minPrice IS NULL OR e.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR e.price <= :maxPrice) " +
           "AND (:dateFrom IS NULL OR e.dateStart >= :dateFrom) " +
           "AND (:dateTo IS NULL OR e.dateStart <= :dateTo) " +
           "AND (:search IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<EventEntity> findWithFilters(
            @Param("status") String status,
            @Param("type") String type,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("dateFrom") Instant dateFrom,
            @Param("dateTo") Instant dateTo,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT e FROM EventEntity e " +
           "WHERE e.status = 'PUBLISHED' " +
           "AND e.dateStart > CURRENT_TIMESTAMP " +
           "ORDER BY e.dateStart ASC")
    List<EventEntity> findUpcomingPublishedEvents(Pageable pageable);

    Page<EventEntity> findByOrganizerSlug(String organizerSlug, Pageable pageable);

    long countByOrganizerSlug(String organizerSlug);
}