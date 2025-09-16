package org.aquastream.common.health;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.common.config.ServiceUrls;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Health checker for inter-service communication.
 * Monitors the health of dependent services and provides status information.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ServiceHealthChecker {
    
    private final ServiceUrls serviceUrls;
    private final RestTemplate restTemplate;
    
    // Cache health status to avoid overwhelming services
    private final Map<String, ServiceHealthStatus> healthCache = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_MS = 30000; // 30 seconds
    
    /**
     * Get health status of all services
     */
    public Map<String, Object> getAllServicesHealth() {
        Map<String, Object> details = new HashMap<>();
        boolean allHealthy = true;
        
        // Check all configured services
        Map<String, ServiceUrls.ServiceConfig> services = getAllServices();
        
        for (Map.Entry<String, ServiceUrls.ServiceConfig> entry : services.entrySet()) {
            String serviceName = entry.getKey();
            ServiceUrls.ServiceConfig config = entry.getValue();
            
            if (!config.isHealthCheckEnabled()) {
                details.put(serviceName, "DISABLED");
                continue;
            }
            
            ServiceHealthStatus status = checkServiceHealth(serviceName, config);
            details.put(serviceName, status.getStatus());
            
            if (!status.isHealthy()) {
                allHealthy = false;
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("overall", allHealthy ? "UP" : "DOWN");
        result.put("services", details);
        result.put("timestamp", System.currentTimeMillis());
        
        return result;
    }
    
    /**
     * Check the health of a specific service
     */
    public ServiceHealthStatus checkServiceHealth(String serviceName, ServiceUrls.ServiceConfig config) {
        String cacheKey = serviceName;
        ServiceHealthStatus cached = healthCache.get(cacheKey);
        
        // Return cached result if still valid
        if (cached != null && !cached.isExpired()) {
            return cached;
        }
        
        try {
            log.debug("Checking health of service: {}", serviceName);
            
            ResponseEntity<Map> response = restTemplate.getForEntity(
                config.getHealthUrl(), 
                Map.class
            );
            
            ServiceHealthStatus status = new ServiceHealthStatus(
                serviceName,
                response.getStatusCode() == HttpStatus.OK,
                response.getStatusCode().toString(),
                System.currentTimeMillis()
            );
            
            healthCache.put(cacheKey, status);
            return status;
            
        } catch (Exception e) {
            log.warn("Health check failed for service {}: {}", serviceName, e.getMessage());
            
            ServiceHealthStatus status = new ServiceHealthStatus(
                serviceName,
                false,
                "ERROR: " + e.getMessage(),
                System.currentTimeMillis()
            );
            
            healthCache.put(cacheKey, status);
            return status;
        }
    }
    
    /**
     * Check all services asynchronously
     */
    public CompletableFuture<Map<String, ServiceHealthStatus>> checkAllServicesAsync() {
        return CompletableFuture.supplyAsync(() -> {
            Map<String, ServiceHealthStatus> results = new HashMap<>();
            Map<String, ServiceUrls.ServiceConfig> services = getAllServices();
            
            for (Map.Entry<String, ServiceUrls.ServiceConfig> entry : services.entrySet()) {
                String serviceName = entry.getKey();
                ServiceUrls.ServiceConfig config = entry.getValue();
                
                if (config.isHealthCheckEnabled()) {
                    results.put(serviceName, checkServiceHealth(serviceName, config));
                }
            }
            
            return results;
        });
    }
    
    private Map<String, ServiceUrls.ServiceConfig> getAllServices() {
        Map<String, ServiceUrls.ServiceConfig> services = new HashMap<>();
        services.put("user", serviceUrls.getUser());
        services.put("event", serviceUrls.getEvent());
        services.put("crew", serviceUrls.getCrew());
        services.put("payment", serviceUrls.getPayment());
        services.put("notification", serviceUrls.getNotification());
        services.put("media", serviceUrls.getMedia());
        services.put("gateway", serviceUrls.getGateway());
        return services;
    }
    
    /**
     * Health status for a single service
     */
    public static class ServiceHealthStatus {
        private final String serviceName;
        private final boolean healthy;
        private final String status;
        private final long timestamp;
        
        public ServiceHealthStatus(String serviceName, boolean healthy, String status, long timestamp) {
            this.serviceName = serviceName;
            this.healthy = healthy;
            this.status = status;
            this.timestamp = timestamp;
        }
        
        public boolean isHealthy() {
            return healthy;
        }
        
        public String getStatus() {
            return status;
        }
        
        public boolean isExpired() {
            return System.currentTimeMillis() - timestamp > CACHE_TTL_MS;
        }
        
        public String getServiceName() {
            return serviceName;
        }
        
        public long getTimestamp() {
            return timestamp;
        }
    }
}