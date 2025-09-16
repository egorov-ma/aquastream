package org.aquastream.event.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.event.db.entity.BookingEntity;
import org.aquastream.event.service.BookingService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Scheduled job for automatic booking expiration.
 * 
 * Runs every 60 seconds to find and expire PENDING bookings that have passed their expiration time.
 * When bookings expire, they free up event capacity for new bookings or waitlist processing.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "aquastream.scheduling.enabled", havingValue = "true", matchIfMissing = true)
public class BookingExpirationScheduler {
    
    private final BookingService bookingService;
    
    /**
     * Find and expire pending bookings that have passed their expiration time.
     * Runs every 60 seconds (60000 milliseconds).
     */
    @Scheduled(fixedDelay = 60000)
    public void expireBookings() {
        try {
            log.debug("Running booking expiration job");
            
            // Find expired pending bookings
            List<BookingEntity> expiredBookings = bookingService.findExpiredPendingBookings();
            
            if (expiredBookings.isEmpty()) {
                log.debug("No expired bookings found");
                return;
            }
            
            log.info("Found {} expired bookings to process", expiredBookings.size());
            
            // Expire the bookings
            bookingService.expireBookings(expiredBookings);
            
            log.info("Successfully expired {} bookings", expiredBookings.size());
            
        } catch (Exception e) {
            log.error("Error during booking expiration job", e);
            // Don't rethrow - we don't want to break the scheduler
        }
    }
}