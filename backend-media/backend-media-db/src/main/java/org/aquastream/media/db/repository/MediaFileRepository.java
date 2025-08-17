package org.aquastream.media.db.repository;

import org.aquastream.media.db.entity.MediaFileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MediaFileRepository extends JpaRepository<MediaFileEntity, UUID> {

    Optional<MediaFileEntity> findByKey(String key);

    List<MediaFileEntity> findByOwnerTypeAndOwnerIdOrderByCreatedAtDesc(String ownerType, UUID ownerId);

    List<MediaFileEntity> findByOwnerTypeAndOwnerIdAndStatusOrderByCreatedAtDesc(
            String ownerType, UUID ownerId, MediaFileEntity.FileStatus status);

    List<MediaFileEntity> findByOwnerTypeAndOwnerIdAndVisibilityOrderByCreatedAtDesc(
            String ownerType, UUID ownerId, MediaFileEntity.FileVisibility visibility);

    Optional<MediaFileEntity> findByChecksum(String checksum);

    List<MediaFileEntity> findByUploadSessionId(UUID uploadSessionId);

    @Query("SELECT mf FROM MediaFileEntity mf WHERE mf.status = :status ORDER BY mf.createdAt")
    List<MediaFileEntity> findByStatusOrderByCreatedAt(@Param("status") MediaFileEntity.FileStatus status);

    @Query("SELECT mf FROM MediaFileEntity mf WHERE mf.expiresAt IS NOT NULL AND mf.expiresAt <= :now AND mf.status != 'DELETED'")
    List<MediaFileEntity> findExpiredFiles(@Param("now") Instant now);

    @Query("SELECT mf FROM MediaFileEntity mf WHERE mf.uploadedBy = :userId ORDER BY mf.createdAt DESC")
    List<MediaFileEntity> findByUploadedByOrderByCreatedAtDesc(@Param("userId") UUID userId);

    @Query("SELECT COUNT(mf) FROM MediaFileEntity mf WHERE mf.ownerType = :ownerType AND mf.ownerId = :ownerId AND mf.status IN ('UPLOADED', 'READY')")
    long countActiveFilesByOwner(@Param("ownerType") String ownerType, @Param("ownerId") UUID ownerId);

    @Query("SELECT SUM(mf.sizeBytes) FROM MediaFileEntity mf WHERE mf.ownerType = :ownerType AND mf.ownerId = :ownerId AND mf.status IN ('UPLOADED', 'READY')")
    Long sumFileSizesByOwner(@Param("ownerType") String ownerType, @Param("ownerId") UUID ownerId);

    @Query("SELECT mf FROM MediaFileEntity mf WHERE mf.visibility = 'PUBLIC' AND mf.status = 'READY' ORDER BY mf.createdAt DESC")
    List<MediaFileEntity> findPublicFiles();

    @Query("SELECT mf FROM MediaFileEntity mf WHERE mf.status = :status AND mf.createdAt <= :before")
    List<MediaFileEntity> findStaleFilesByStatus(@Param("status") MediaFileEntity.FileStatus status, @Param("before") Instant before);

    boolean existsByKey(String key);

    boolean existsByChecksum(String checksum);

    void deleteByKey(String key);
}