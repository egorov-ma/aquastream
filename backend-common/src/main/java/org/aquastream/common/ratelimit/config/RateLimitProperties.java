package org.aquastream.common.ratelimit.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Configuration properties for rate limiting
 */
@Data
@ConfigurationProperties(prefix = "aquastream.rate-limit")
public class RateLimitProperties {

    /**
     * Whether rate limiting is enabled
     */
    private boolean enabled = true;

    /**
     * Default rate limit configuration
     */
    private RateLimit defaultLimit = new RateLimit();

    /**
     * Rate limits for specific endpoints or categories
     */
    private Map<String, RateLimit> limits = new HashMap<>();

    /**
     * Rate limit configuration for a specific endpoint or category
     */
    @Data
    public static class RateLimit {
        
        /**
         * Number of requests allowed per time window
         */
        private long capacity = 100;
        
        /**
         * Time window duration
         */
        private Duration window = Duration.ofMinutes(1);
        
        /**
         * Token refill rate (tokens per second)
         */
        private long refillTokens = 10;
        
        /**
         * Refill period
         */
        private Duration refillPeriod = Duration.ofSeconds(1);
        
        /**
         * Whether this rate limit is enabled
         */
        private boolean enabled = true;
        
        /**
         * Custom Retry-After header value in seconds (optional)
         */
        private Long retryAfterSeconds;
    }
    
    /**
     * Get rate limit configuration for a specific key
     */
    public RateLimit getLimit(String key) {
        return limits.getOrDefault(key, defaultLimit);
    }
    
    /**
     * Check if rate limiting is enabled for a specific key
     */
    public boolean isEnabledForKey(String key) {
        return enabled && getLimit(key).isEnabled();
    }
}