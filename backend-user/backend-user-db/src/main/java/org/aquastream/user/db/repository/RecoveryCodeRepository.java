package org.aquastream.user.db.repository;

import org.aquastream.user.db.entity.RecoveryCodeEntity;
import org.aquastream.user.db.entity.RecoveryCodeId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.UUID;

public interface RecoveryCodeRepository extends JpaRepository<RecoveryCodeEntity, RecoveryCodeId> {
    long deleteByUserId(UUID userId);
    long deleteByUserIdAndExpiresAtBefore(UUID userId, Instant instant);
}


