package org.aquastream.notification.service.notification.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.aquastream.notification.db.entity.NotificationPrefsEntity;

import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {

    @NotNull(message = "User ID is required")
    @JsonProperty("userId")
    private UUID userId;

    @NotNull(message = "Category is required")
    @JsonProperty("category")
    private NotificationPrefsEntity.NotificationCategory category;

    @JsonProperty("channel")
    private NotificationPrefsEntity.NotificationChannel channel;

    @NotNull(message = "Title is required")
    @JsonProperty("title")
    private String title;

    @NotNull(message = "Message is required")
    @JsonProperty("message")
    private String message;

    @JsonProperty("metadata")
    private Map<String, Object> metadata;

    @JsonProperty("templateId")
    private String templateId;

    @JsonProperty("templateParams")
    private Map<String, Object> templateParams;

    // Optional fields for specific channels
    @JsonProperty("emailSubject")
    private String emailSubject;

    @JsonProperty("smsShortText")
    private String smsShortText;

    @JsonProperty("pushAction")
    private String pushAction;

    @JsonProperty("urgent")
    @Builder.Default
    private Boolean urgent = false;

    @JsonProperty("scheduledAt")
    private Long scheduledAt; // Unix timestamp

    @JsonProperty("expiresAt")
    private Long expiresAt; // Unix timestamp

    // Validation helpers
    public boolean isRequired() {
        return category == NotificationPrefsEntity.NotificationCategory.BOOKING_CONFIRMED ||
               category == NotificationPrefsEntity.NotificationCategory.PAYMENT_STATUS ||
               category == NotificationPrefsEntity.NotificationCategory.EVENT_REMINDER;
    }

    public boolean isOptional() {
        return !isRequired();
    }
}