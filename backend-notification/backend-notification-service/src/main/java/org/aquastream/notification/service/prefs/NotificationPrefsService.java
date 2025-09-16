package org.aquastream.notification.service.prefs;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.notification.db.entity.NotificationPrefsEntity;
import org.aquastream.notification.db.repository.NotificationPrefsRepository;
import org.aquastream.notification.service.notification.RedisNotificationPublisher;
import org.aquastream.notification.service.prefs.dto.NotificationPrefsDto;
import org.aquastream.notification.service.prefs.dto.UpdatePrefsRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationPrefsService {

    private final NotificationPrefsRepository notificationPrefsRepository;
    private final RedisNotificationPublisher redisPublisher;

    /**
     * Get all notification preferences for a user
     */
    @Transactional(readOnly = true)
    public List<NotificationPrefsDto> getUserPrefs(UUID userId) {
        log.debug("Getting notification preferences for user: {}", userId);
        
        List<NotificationPrefsEntity> entities = notificationPrefsRepository.findByUserId(userId);
        
        // If no preferences exist, create defaults
        if (entities.isEmpty()) {
            entities = createDefaultPrefs(userId);
        }
        
        return entities.stream()
                .map(NotificationPrefsDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Update user notification preferences
     */
    public List<NotificationPrefsDto> updateUserPrefs(UUID userId, UpdatePrefsRequest request) {
        log.info("Updating notification preferences for user: {}", userId);
        
        List<NotificationPrefsEntity> updatedEntities = new ArrayList<>();
        
        for (UpdatePrefsRequest.PreferenceUpdate update : request.getPreferences()) {
            validatePreferenceUpdate(update);
            
            NotificationPrefsEntity entity = notificationPrefsRepository
                    .findByUserIdAndCategoryAndChannel(userId, update.getCategory(), update.getChannel())
                    .orElse(createNewPreference(userId, update.getCategory(), update.getChannel()));
            
            // Don't allow disabling required notifications
            if (isRequiredCategory(update.getCategory()) && Boolean.FALSE.equals(update.getEnabled())) {
                log.warn("Attempted to disable required notification category {} for user {}", 
                        update.getCategory(), userId);
                throw new IllegalArgumentException(
                        "Cannot disable required notification category: " + update.getCategory());
            }
            
            entity.setEnabled(update.getEnabled());
            entity.setUpdatedAt(Instant.now());
            
            NotificationPrefsEntity saved = notificationPrefsRepository.save(entity);
            updatedEntities.add(saved);
            
            // Publish preferences change event to Redis
            try {
                redisPublisher.publishPreferencesChanged(
                        userId, 
                        update.getCategory().name(), 
                        update.getChannel().name(), 
                        update.getEnabled()
                );
            } catch (Exception e) {
                log.warn("Failed to publish preferences change to Redis for user {}: {}", 
                        userId, e.getMessage());
            }
        }
        
        return updatedEntities.stream()
                .map(NotificationPrefsDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get preferences for a specific category
     */
    @Transactional(readOnly = true)
    public List<NotificationPrefsDto> getCategoryPrefs(UUID userId, String categoryStr) {
        log.debug("Getting category preferences for user {} and category: {}", userId, categoryStr);
        
        NotificationPrefsEntity.NotificationCategory category;
        try {
            category = NotificationPrefsEntity.NotificationCategory.valueOf(categoryStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid category: " + categoryStr);
        }
        
        List<NotificationPrefsEntity> entities = notificationPrefsRepository
                .findByUserIdAndCategory(userId, category);
        
        // If no preferences exist for this category, create defaults
        if (entities.isEmpty()) {
            entities = createDefaultPrefsForCategory(userId, category);
        }
        
        return entities.stream()
                .map(NotificationPrefsDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Reset user preferences to defaults
     */
    public List<NotificationPrefsDto> resetToDefaults(UUID userId) {
        log.info("Resetting notification preferences to defaults for user: {}", userId);
        
        // Delete existing preferences
        notificationPrefsRepository.deleteByUserId(userId);
        
        // Create new default preferences
        List<NotificationPrefsEntity> defaultEntities = createDefaultPrefs(userId);
        
        return defaultEntities.stream()
                .map(NotificationPrefsDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Check if user has notification enabled for specific category and channel
     */
    @Transactional(readOnly = true)
    public boolean isNotificationEnabled(UUID userId, 
                                       NotificationPrefsEntity.NotificationCategory category,
                                       NotificationPrefsEntity.NotificationChannel channel) {
        
        return notificationPrefsRepository
                .findByUserIdAndCategoryAndChannel(userId, category, channel)
                .map(NotificationPrefsEntity::getEnabled)
                .orElse(getDefaultEnabled(category, channel));
    }

    /**
     * Get enabled channels for user and category
     */
    @Transactional(readOnly = true)
    public List<NotificationPrefsEntity.NotificationChannel> getEnabledChannels(
            UUID userId, NotificationPrefsEntity.NotificationCategory category) {
        
        List<NotificationPrefsEntity> prefs = notificationPrefsRepository
                .findByUserIdAndCategory(userId, category);
        
        if (prefs.isEmpty()) {
            // Return default enabled channels for this category
            return getDefaultEnabledChannels(category);
        }
        
        return prefs.stream()
                .filter(NotificationPrefsEntity::getEnabled)
                .map(NotificationPrefsEntity::getChannel)
                .collect(Collectors.toList());
    }

    private List<NotificationPrefsEntity> createDefaultPrefs(UUID userId) {
        log.debug("Creating default preferences for user: {}", userId);
        
        List<NotificationPrefsEntity> defaults = new ArrayList<>();
        Instant now = Instant.now();
        
        // Create preferences for all category/channel combinations
        for (NotificationPrefsEntity.NotificationCategory category : 
             NotificationPrefsEntity.NotificationCategory.values()) {
            for (NotificationPrefsEntity.NotificationChannel channel : 
                 NotificationPrefsEntity.NotificationChannel.values()) {
                
                NotificationPrefsEntity.NotificationPrefsId id = 
                        NotificationPrefsEntity.NotificationPrefsId.builder()
                                .userId(userId)
                                .category(category)
                                .channel(channel)
                                .build();
                
                NotificationPrefsEntity pref = NotificationPrefsEntity.builder()
                        .id(id)
                        .enabled(getDefaultEnabled(category, channel))
                        .build();
                
                defaults.add(notificationPrefsRepository.save(pref));
            }
        }
        
        return defaults;
    }

    private List<NotificationPrefsEntity> createDefaultPrefsForCategory(
            UUID userId, NotificationPrefsEntity.NotificationCategory category) {
        
        List<NotificationPrefsEntity> defaults = new ArrayList<>();
        Instant now = Instant.now();
        
        for (NotificationPrefsEntity.NotificationChannel channel : 
             NotificationPrefsEntity.NotificationChannel.values()) {
            
            NotificationPrefsEntity.NotificationPrefsId id = 
                    NotificationPrefsEntity.NotificationPrefsId.builder()
                            .userId(userId)
                            .category(category)
                            .channel(channel)
                            .build();
            
            NotificationPrefsEntity pref = NotificationPrefsEntity.builder()
                    .id(id)
                    .enabled(getDefaultEnabled(category, channel))
                    .build();
            
            defaults.add(notificationPrefsRepository.save(pref));
        }
        
        return defaults;
    }

    private NotificationPrefsEntity createNewPreference(UUID userId,
                                                      NotificationPrefsEntity.NotificationCategory category,
                                                      NotificationPrefsEntity.NotificationChannel channel) {
        Instant now = Instant.now();
        
        NotificationPrefsEntity.NotificationPrefsId id = 
                NotificationPrefsEntity.NotificationPrefsId.builder()
                        .userId(userId)
                        .category(category)
                        .channel(channel)
                        .build();
        
        return NotificationPrefsEntity.builder()
                .id(id)
                .enabled(getDefaultEnabled(category, channel))
                .build();
    }

    private boolean getDefaultEnabled(NotificationPrefsEntity.NotificationCategory category,
                                    NotificationPrefsEntity.NotificationChannel channel) {
        // Required categories are enabled by default for all channels
        if (isRequiredCategory(category)) {
            return true;
        }
        
        // Optional categories default settings
        switch (category) {
            case WAITLIST_AVAILABLE:
                return channel == NotificationPrefsEntity.NotificationChannel.EMAIL ||
                       channel == NotificationPrefsEntity.NotificationChannel.TELEGRAM;
            case EVENT_NEWS:
                return channel == NotificationPrefsEntity.NotificationChannel.EMAIL;
            default:
                return true;
        }
    }

    private List<NotificationPrefsEntity.NotificationChannel> getDefaultEnabledChannels(
            NotificationPrefsEntity.NotificationCategory category) {
        
        if (isRequiredCategory(category)) {
            return Arrays.asList(NotificationPrefsEntity.NotificationChannel.values());
        }
        
        switch (category) {
            case WAITLIST_AVAILABLE:
                return Arrays.asList(
                        NotificationPrefsEntity.NotificationChannel.EMAIL,
                        NotificationPrefsEntity.NotificationChannel.TELEGRAM
                );
            case EVENT_NEWS:
                return Arrays.asList(NotificationPrefsEntity.NotificationChannel.EMAIL);
            default:
                return Arrays.asList(NotificationPrefsEntity.NotificationChannel.values());
        }
    }

    private boolean isRequiredCategory(NotificationPrefsEntity.NotificationCategory category) {
        return category == NotificationPrefsEntity.NotificationCategory.BOOKING_CONFIRMED ||
               category == NotificationPrefsEntity.NotificationCategory.PAYMENT_STATUS ||
               category == NotificationPrefsEntity.NotificationCategory.EVENT_REMINDER;
    }

    private void validatePreferenceUpdate(UpdatePrefsRequest.PreferenceUpdate update) {
        if (update.getCategory() == null) {
            throw new IllegalArgumentException("Category is required");
        }
        
        if (update.getChannel() == null) {
            throw new IllegalArgumentException("Channel is required");
        }
        
        if (update.getEnabled() == null) {
            throw new IllegalArgumentException("Enabled flag is required");
        }
    }
}