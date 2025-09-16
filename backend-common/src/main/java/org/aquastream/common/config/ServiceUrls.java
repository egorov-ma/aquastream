package org.aquastream.common.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Centralized configuration for inter-service communication URLs.
 * This class provides a single source of truth for all service endpoints.
 */
@Component
@ConfigurationProperties(prefix = "app.services")
@Data
public class ServiceUrls {
    
    /**
     * User service configuration
     */
    private ServiceConfig user = new ServiceConfig("http://localhost:8101");
    
    /**
     * Event service configuration
     */
    private ServiceConfig event = new ServiceConfig("http://localhost:8102");
    
    /**
     * Crew service configuration
     */
    private ServiceConfig crew = new ServiceConfig("http://localhost:8103");
    
    /**
     * Payment service configuration
     */
    private ServiceConfig payment = new ServiceConfig("http://localhost:8104");
    
    /**
     * Notification service configuration
     */
    private ServiceConfig notification = new ServiceConfig("http://localhost:8105");
    
    /**
     * Media service configuration
     */
    private ServiceConfig media = new ServiceConfig("http://localhost:8106");
    
    /**
     * Gateway service configuration
     */
    private ServiceConfig gateway = new ServiceConfig("http://localhost:8080");
    
    /**
     * Individual service configuration
     */
    @Data
    public static class ServiceConfig {
        /**
         * Base URL for the service
         */
        private String baseUrl;
        
        /**
         * Health check endpoint path (default: /actuator/health)
         */
        private String healthPath = "/actuator/health";
        
        /**
         * Connection timeout in milliseconds (default: 5000ms)
         */
        private int connectionTimeout = 5000;
        
        /**
         * Read timeout in milliseconds (default: 10000ms)
         */
        private int readTimeout = 10000;
        
        /**
         * Whether to enable health checks for this service
         */
        private boolean healthCheckEnabled = true;
        
        public ServiceConfig() {}
        
        public ServiceConfig(String baseUrl) {
            this.baseUrl = baseUrl;
        }
        
        /**
         * Get the full health check URL
         */
        public String getHealthUrl() {
            return baseUrl + healthPath;
        }
    }
}