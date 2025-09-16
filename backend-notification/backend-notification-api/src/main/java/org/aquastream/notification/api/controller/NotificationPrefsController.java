package org.aquastream.notification.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.notification.service.prefs.NotificationPrefsService;
import org.aquastream.notification.service.prefs.dto.NotificationPrefsDto;
import org.aquastream.notification.service.prefs.dto.UpdatePrefsRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notify/prefs")
@RequiredArgsConstructor
@Slf4j
public class NotificationPrefsController {

    private final NotificationPrefsService notificationPrefsService;

    /**
     * Get user notification preferences
     */
    @GetMapping
    public ResponseEntity<List<NotificationPrefsDto>> getUserPrefs(
            @RequestHeader("X-User-Id") UUID userId) {
        
        log.info("Getting notification preferences for user: {}", userId);
        
        List<NotificationPrefsDto> prefs = notificationPrefsService.getUserPrefs(userId);
        
        return ResponseEntity.ok(prefs);
    }

    /**
     * Update user notification preferences
     */
    @PutMapping
    public ResponseEntity<List<NotificationPrefsDto>> updateUserPrefs(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody UpdatePrefsRequest request) {
        
        log.info("Updating notification preferences for user: {}", userId);
        
        List<NotificationPrefsDto> updatedPrefs = notificationPrefsService.updateUserPrefs(userId, request);
        
        return ResponseEntity.ok(updatedPrefs);
    }

    /**
     * Get notification preferences for specific category
     */
    @GetMapping("/{category}")
    public ResponseEntity<List<NotificationPrefsDto>> getCategoryPrefs(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable String category) {
        
        log.info("Getting preferences for user {} and category: {}", userId, category);
        
        List<NotificationPrefsDto> prefs = notificationPrefsService.getCategoryPrefs(userId, category);
        
        return ResponseEntity.ok(prefs);
    }

    /**
     * Reset preferences to defaults
     */
    @PostMapping("/reset")
    public ResponseEntity<List<NotificationPrefsDto>> resetToDefaults(
            @RequestHeader("X-User-Id") UUID userId) {
        
        log.info("Resetting notification preferences to defaults for user: {}", userId);
        
        List<NotificationPrefsDto> prefs = notificationPrefsService.resetToDefaults(userId);
        
        return ResponseEntity.ok(prefs);
    }
}