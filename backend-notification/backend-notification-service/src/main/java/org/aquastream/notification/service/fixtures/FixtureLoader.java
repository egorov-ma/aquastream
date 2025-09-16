package org.aquastream.notification.service.fixtures;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.notification.db.entity.NotificationPrefsEntity;
import org.aquastream.notification.db.entity.TelegramSubscriptionEntity;
import org.aquastream.notification.db.repository.NotificationPrefsRepository;
import org.aquastream.notification.db.repository.TelegramSubscriptionRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

/**
 * Component for loading test fixtures in development mode
 */
@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "fixtures.enabled", havingValue = "true")
public class FixtureLoader {

    private final NotificationPrefsRepository prefsRepository;
    private final TelegramSubscriptionRepository telegramRepository;

    @EventListener(ApplicationReadyEvent.class)
    public void loadFixtures() {
        if (prefsRepository.count() > 0) {
            log.info("Database not empty, skipping fixture loading");
            return;
        }

        log.info("Loading development fixtures...");

        try {
            loadTestUsers();
            loadTestPreferences();
            loadTelegramSubscriptions();
            
            log.info("Development fixtures loaded successfully");
            
        } catch (Exception e) {
            log.error("Error loading fixtures", e);
        }
    }

    private void loadTestUsers() {
        log.debug("Loading test users...");
        // Note: Users are managed by user-service, we just reference them by ID
        // In a real scenario, we might make API calls to user-service to create users
    }

    private void loadTestPreferences() {
        log.debug("Loading test notification preferences...");

        // Test User 1 preferences
        UUID testUser1 = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
        createPreference(testUser1, NotificationPrefsEntity.NotificationCategory.BOOKING_CONFIRMED, 
                        NotificationPrefsEntity.NotificationChannel.TELEGRAM, true);
        createPreference(testUser1, NotificationPrefsEntity.NotificationCategory.BOOKING_CONFIRMED, 
                        NotificationPrefsEntity.NotificationChannel.EMAIL, true);
        createPreference(testUser1, NotificationPrefsEntity.NotificationCategory.EVENT_NEWS, 
                        NotificationPrefsEntity.NotificationChannel.EMAIL, false);
        createPreference(testUser1, NotificationPrefsEntity.NotificationCategory.PAYMENT_STATUS, 
                        NotificationPrefsEntity.NotificationChannel.TELEGRAM, true);

        // Test User 2 preferences
        UUID testUser2 = UUID.fromString("550e8400-e29b-41d4-a716-446655440001");
        createPreference(testUser2, NotificationPrefsEntity.NotificationCategory.BOOKING_CONFIRMED, 
                        NotificationPrefsEntity.NotificationChannel.EMAIL, true);
        createPreference(testUser2, NotificationPrefsEntity.NotificationCategory.EVENT_NEWS, 
                        NotificationPrefsEntity.NotificationChannel.EMAIL, true);
        createPreference(testUser2, NotificationPrefsEntity.NotificationCategory.WAITLIST_AVAILABLE, 
                        NotificationPrefsEntity.NotificationChannel.TELEGRAM, true);

        log.debug("Created {} notification preferences", prefsRepository.count());
    }

    private void loadTelegramSubscriptions() {
        log.debug("Loading test Telegram subscriptions...");

        // Test User 1 Telegram subscription
        UUID testUser1 = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
        createTelegramSubscription(testUser1, 123456789L, 111111111L, "testuser1");

        // Test User 2 Telegram subscription
        UUID testUser2 = UUID.fromString("550e8400-e29b-41d4-a716-446655440001");
        createTelegramSubscription(testUser2, 987654321L, 222222222L, "testuser2");

        log.debug("Created {} Telegram subscriptions", telegramRepository.count());
    }

    private void createPreference(UUID userId, 
                                NotificationPrefsEntity.NotificationCategory category,
                                NotificationPrefsEntity.NotificationChannel channel,
                                boolean enabled) {
        
        NotificationPrefsEntity.NotificationPrefsId id = 
                NotificationPrefsEntity.NotificationPrefsId.builder()
                        .userId(userId)
                        .category(category)
                        .channel(channel)
                        .build();

        NotificationPrefsEntity pref = NotificationPrefsEntity.builder()
                .id(id)
                .enabled(enabled)
                .build();

        prefsRepository.save(pref);
        
        log.trace("Created preference: user={}, category={}, channel={}, enabled={}", 
                userId, category, channel, enabled);
    }

    private void createTelegramSubscription(UUID userId, Long chatId, Long telegramUserId, String username) {
        TelegramSubscriptionEntity subscription = TelegramSubscriptionEntity.builder()
                .userId(userId)
                .telegramChatId(chatId)
                .telegramUserId(telegramUserId)
                .telegramUsername(username)
                .verifiedAt(Instant.now()) // Pre-verified for testing
                .isActive(true)
                .build();

        telegramRepository.save(subscription);
        
        log.trace("Created Telegram subscription: user={}, chatId={}, telegramUserId={}, username={}", 
                userId, chatId, telegramUserId, username);
    }
}