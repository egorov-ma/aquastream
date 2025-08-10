package org.aquastream.user.db.repo;

import org.aquastream.user.db.entity.RefreshSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface RefreshSessionRepository extends JpaRepository<RefreshSessionEntity, String> {
    long deleteByUserId(UUID userId);
}


