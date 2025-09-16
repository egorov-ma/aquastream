package org.aquastream.notification.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.notification.service.notification.NotificationService;
import org.aquastream.notification.service.notification.dto.NotificationRequest;
import org.aquastream.notification.service.notification.dto.NotificationResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/notify")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Internal endpoint for sending notifications
     * Used by other services to send notifications to users
     */
    @PostMapping("/send")
    public ResponseEntity<NotificationResponse> sendNotification(@Valid @RequestBody NotificationRequest request) {
        log.info("Received notification request: userId={}, category={}, channel={}", 
                 request.getUserId(), request.getCategory(), request.getChannel());

        try {
            NotificationResponse response = notificationService.sendNotification(request);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error processing notification request", e);
            
            NotificationResponse errorResponse = NotificationResponse.builder()
                    .success(false)
                    .message("Failed to process notification: " + e.getMessage())
                    .build();
            
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * Health check for notification service
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "healthy",
                "service", "notification",
                "timestamp", System.currentTimeMillis()
        ));
    }
}