package org.aquastream.media.db.repository;

import org.aquastream.media.db.entity.CleanupLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface CleanupLogRepository extends JpaRepository<CleanupLogEntity, Long> {

    List<CleanupLogEntity> findByCleanedAtBetweenOrderByCleanedAtDesc(Instant start, Instant end);

    @Query("SELECT SUM(c.filesDeleted) FROM CleanupLogEntity c WHERE c.cleanedAt >= :since")
    Long sumFilesDeletedSince(@Param("since") Instant since);

    @Query("SELECT c FROM CleanupLogEntity c ORDER BY c.cleanedAt DESC LIMIT 10")
    List<CleanupLogEntity> findRecentCleanups();
}