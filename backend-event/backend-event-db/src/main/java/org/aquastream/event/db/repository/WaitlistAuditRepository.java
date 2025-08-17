package org.aquastream.event.db.repository;

import org.aquastream.event.db.entity.WaitlistAuditEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface WaitlistAuditRepository extends JpaRepository<WaitlistAuditEntity, UUID> {

    List<WaitlistAuditEntity> findByEventIdOrderByCreatedAtDesc(UUID eventId);
    
    List<WaitlistAuditEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);
    
    List<WaitlistAuditEntity> findByEventIdAndUserIdOrderByCreatedAtDesc(UUID eventId, UUID userId);
    
    List<WaitlistAuditEntity> findByActionOrderByCreatedAtDesc(String action);
    
    List<WaitlistAuditEntity> findByCreatedAtBetweenOrderByCreatedAtDesc(Instant from, Instant to);
}