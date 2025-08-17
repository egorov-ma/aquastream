package org.aquastream.media.service.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.media.db.entity.CleanupLogEntity;
import org.aquastream.media.db.entity.MediaFileEntity;
import org.aquastream.media.db.repository.CleanupLogRepository;
import org.aquastream.media.db.repository.MediaFileRepository;
import org.aquastream.media.service.config.MediaStorageProperties;
import org.aquastream.media.service.storage.StorageService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileCleanupScheduler {

    private final MediaFileRepository mediaFileRepository;
    private final CleanupLogRepository cleanupLogRepository;
    private final StorageService storageService;
    private final MediaStorageProperties properties;

    /**
     * Clean up expired files daily at 2 AM
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void cleanupExpiredFiles() {
        log.info("Starting scheduled cleanup of expired files");
        
        Instant now = Instant.now();
        List<MediaFileEntity> expiredFiles = mediaFileRepository.findExpiredFiles(now);
        
        int deletedCount = 0;
        for (MediaFileEntity file : expiredFiles) {
            try {
                // Delete from storage
                storageService.deleteObject(file.getKey());
                
                // Mark as deleted in database
                file.setStatus(MediaFileEntity.FileStatus.DELETED);
                file.setUpdatedAt(now);
                mediaFileRepository.save(file);
                
                deletedCount++;
                log.debug("Deleted expired file: {}", file.getKey());
                
            } catch (Exception e) {
                log.error("Failed to delete expired file: {}", file.getKey(), e);
            }
        }
        
        // Log cleanup operation
        CleanupLogEntity cleanupLog = CleanupLogEntity.builder()
                .cleanedAt(now)
                .filesDeleted(deletedCount)
                .build();
        cleanupLogRepository.save(cleanupLog);
        
        log.info("Completed scheduled cleanup. Deleted {} expired files", deletedCount);
    }

    /**
     * Clean up stale uploading files every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    @Transactional
    public void cleanupStaleUploads() {
        log.debug("Starting cleanup of stale uploads");
        
        Instant cutoff = Instant.now().minusSeconds(
                properties.getRetention().getTempFilesDays() * 24L * 60L * 60L);
        
        List<MediaFileEntity> staleUploads = mediaFileRepository.findStaleFilesByStatus(
                MediaFileEntity.FileStatus.UPLOADING, cutoff);
        
        int deletedCount = 0;
        for (MediaFileEntity file : staleUploads) {
            try {
                // Try to delete from storage (may not exist)
                try {
                    storageService.deleteObject(file.getKey());
                } catch (Exception e) {
                    log.debug("Storage object not found for stale upload: {}", file.getKey());
                }
                
                // Mark as deleted in database
                file.setStatus(MediaFileEntity.FileStatus.DELETED);
                file.setUpdatedAt(Instant.now());
                mediaFileRepository.save(file);
                
                deletedCount++;
                log.debug("Cleaned up stale upload: {}", file.getKey());
                
            } catch (Exception e) {
                log.error("Failed to cleanup stale upload: {}", file.getKey(), e);
            }
        }
        
        if (deletedCount > 0) {
            log.info("Cleaned up {} stale uploads", deletedCount);
        }
    }

    /**
     * Clean up old cleanup logs monthly
     */
    @Scheduled(cron = "0 0 3 1 * *") // 3 AM on 1st of each month
    @Transactional
    public void cleanupOldLogs() {
        log.info("Starting cleanup of old logs");
        
        Instant cutoff = Instant.now().minusSeconds(
                properties.getRetention().getLogRetentionDays() * 24L * 60L * 60L);
        
        List<CleanupLogEntity> oldLogs = cleanupLogRepository.findByCleanedAtBetweenOrderByCleanedAtDesc(
                Instant.EPOCH, cutoff);
        
        if (!oldLogs.isEmpty()) {
            cleanupLogRepository.deleteAll(oldLogs);
            log.info("Deleted {} old cleanup log entries", oldLogs.size());
        }
    }

    /**
     * Health check - verify storage connectivity
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void healthCheck() {
        try {
            // Try to generate a test presigned URL to verify connectivity
            String testKey = "health-check/test-" + Instant.now().toEpochMilli();
            storageService.generatePresignedUploadUrl(testKey, "text/plain", 1);
            log.trace("Storage health check passed");
        } catch (Exception e) {
            log.warn("Storage health check failed", e);
        }
    }
}