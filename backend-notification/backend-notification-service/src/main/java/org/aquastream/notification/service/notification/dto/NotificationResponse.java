package org.aquastream.notification.service.notification.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    @JsonProperty("success")
    private Boolean success;

    @JsonProperty("message")
    private String message;

    @JsonProperty("notificationId")
    private UUID notificationId;

    @JsonProperty("sentChannels")
    private List<String> sentChannels;

    @JsonProperty("skippedChannels")
    private List<String> skippedChannels;

    @JsonProperty("failedChannels")
    private List<String> failedChannels;

    @JsonProperty("processedAt")
    private Instant processedAt;

    @JsonProperty("errors")
    private List<String> errors;

    // Helper methods
    public static NotificationResponse success(UUID notificationId, List<String> sentChannels) {
        return NotificationResponse.builder()
                .success(true)
                .message("Notification sent successfully")
                .notificationId(notificationId)
                .sentChannels(sentChannels)
                .processedAt(Instant.now())
                .build();
    }

    public static NotificationResponse partialSuccess(UUID notificationId, List<String> sent, List<String> failed) {
        return NotificationResponse.builder()
                .success(true)
                .message("Notification partially sent")
                .notificationId(notificationId)
                .sentChannels(sent)
                .failedChannels(failed)
                .processedAt(Instant.now())
                .build();
    }

    public static NotificationResponse failure(String message, List<String> errors) {
        return NotificationResponse.builder()
                .success(false)
                .message(message)
                .errors(errors)
                .processedAt(Instant.now())
                .build();
    }
}