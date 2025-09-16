package org.aquastream.user.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.user.service.AuthService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled task to clean up expired refresh sessions.
 * 
 * Runs every hour to mark expired sessions as revoked.
 * This helps keep the database clean and prevents accumulation of old sessions.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(
    name = "app.scheduler.refresh-cleanup.enabled", 
    havingValue = "true", 
    matchIfMissing = true
)
public class RefreshSessionCleanupScheduler {
    
    private final AuthService authService;
    
    /**
     * Clean up expired refresh sessions every hour.
     */
    @Scheduled(fixedDelay = 3600000) // 1 hour in milliseconds
    public void cleanupExpiredSessions() {
        try {
            log.debug("Starting refresh session cleanup");
            int cleanedUp = authService.cleanupExpiredSessions();
            
            if (cleanedUp > 0) {
                log.info("Refresh session cleanup completed: {} expired sessions marked as revoked", cleanedUp);
            } else {
                log.debug("Refresh session cleanup completed: no expired sessions found");
            }
        } catch (Exception e) {
            log.error("Error during refresh session cleanup", e);
        }
    }
}