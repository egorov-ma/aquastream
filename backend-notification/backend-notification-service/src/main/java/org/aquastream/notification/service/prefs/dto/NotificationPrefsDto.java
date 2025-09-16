package org.aquastream.notification.service.prefs.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.aquastream.notification.db.entity.NotificationPrefsEntity;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPrefsDto {

    @JsonProperty("userId")
    private UUID userId;

    @JsonProperty("category")
    private NotificationPrefsEntity.NotificationCategory category;

    @JsonProperty("channel")
    private NotificationPrefsEntity.NotificationChannel channel;

    @JsonProperty("enabled")
    private Boolean enabled;

    @JsonProperty("required")
    private Boolean required;

    @JsonProperty("createdAt")
    private Instant createdAt;

    @JsonProperty("updatedAt")
    private Instant updatedAt;

    // Helper method to determine if preference is required
    public boolean isRequired() {
        return category == NotificationPrefsEntity.NotificationCategory.BOOKING_CONFIRMED ||
               category == NotificationPrefsEntity.NotificationCategory.PAYMENT_STATUS ||
               category == NotificationPrefsEntity.NotificationCategory.EVENT_REMINDER;
    }

    // Convert from entity
    public static NotificationPrefsDto fromEntity(NotificationPrefsEntity entity) {
        NotificationPrefsDto dto = NotificationPrefsDto.builder()
                .userId(entity.getUserId())
                .category(entity.getCategory())
                .channel(entity.getChannel())
                .enabled(entity.getEnabled())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
        
        dto.setRequired(dto.isRequired());
        return dto;
    }
}