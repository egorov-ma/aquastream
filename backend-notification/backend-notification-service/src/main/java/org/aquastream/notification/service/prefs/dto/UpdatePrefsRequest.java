package org.aquastream.notification.service.prefs.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.aquastream.notification.db.entity.NotificationPrefsEntity;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePrefsRequest {

    @NotEmpty(message = "At least one preference update is required")
    @Valid
    @JsonProperty("preferences")
    private List<PreferenceUpdate> preferences;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PreferenceUpdate {
        
        @JsonProperty("category")
        private NotificationPrefsEntity.NotificationCategory category;
        
        @JsonProperty("channel")
        private NotificationPrefsEntity.NotificationChannel channel;
        
        @JsonProperty("enabled")
        private Boolean enabled;
    }
}