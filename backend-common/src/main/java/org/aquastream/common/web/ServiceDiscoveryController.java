package org.aquastream.common.web;

import lombok.RequiredArgsConstructor;
import org.aquastream.common.config.ServiceUrls;
import org.aquastream.common.health.ServiceHealthChecker;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * REST controller for service discovery information and health checks.
 * Provides information about configured services and their health status.
 * Available at /actuator/services when actuator is enabled.
 */
@RestController
@RequestMapping("/actuator/services")
@ConditionalOnWebApplication
@RequiredArgsConstructor
public class ServiceDiscoveryController {
    
    private final ServiceUrls serviceUrls;
    private final ServiceHealthChecker healthChecker;
    
    /**
     * Get all configured service URLs
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getServices() {
        Map<String, Object> response = new HashMap<>();
        
        Map<String, ServiceUrls.ServiceConfig> services = new HashMap<>();
        services.put("user", serviceUrls.getUser());
        services.put("event", serviceUrls.getEvent());
        services.put("crew", serviceUrls.getCrew());
        services.put("payment", serviceUrls.getPayment());
        services.put("notification", serviceUrls.getNotification());
        services.put("media", serviceUrls.getMedia());
        services.put("gateway", serviceUrls.getGateway());
        
        response.put("services", services);
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get health status of all configured services
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getServicesHealth() {
        try {
            Map<String, Object> healthStatus = healthChecker.getAllServicesHealth();
            return ResponseEntity.ok(healthStatus);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("overall", "ERROR");
            errorResponse.put("error", e.getMessage());
            errorResponse.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}