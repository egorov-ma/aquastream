package org.aquastream.common.metrics.writer;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.common.metrics.config.MetricsProperties;
import org.aquastream.common.metrics.model.MetricData;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for writing metrics to Redis with TTL
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RedisMetricsWriter {

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private final MetricsProperties properties;

    /**
     * Write metrics to Redis
     */
    public void writeMetrics(List<MetricData> metrics) {
        if (!properties.isEnabled() || metrics.isEmpty()) {
            return;
        }

        try {
            int successCount = 0;
            int errorCount = 0;

            for (MetricData metric : metrics) {
                try {
                    writeMetric(metric);
                    successCount++;
                } catch (Exception e) {
                    errorCount++;
                    log.error("Failed to write metric to Redis: {}", metric.getRedisKey(), e);
                }
            }

            log.debug("Wrote {} metrics to Redis ({} success, {} errors)", 
                    metrics.size(), successCount, errorCount);

        } catch (Exception e) {
            log.error("Error writing metrics batch to Redis", e);
        }
    }

    /**
     * Write single metric to Redis
     */
    public void writeMetric(MetricData metric) {
        try {
            String key = metric.getRedisKey();
            String jsonValue = serializeMetric(metric);
            
            // Write with TTL
            redisTemplate.opsForValue().set(key, jsonValue, properties.getTtl());
            
            log.trace("Wrote metric to Redis: {} = {}", key, jsonValue);
            
        } catch (Exception e) {
            log.error("Failed to write metric {} to Redis", metric.getRedisKey(), e);
            throw new RuntimeException("Failed to write metric to Redis", e);
        }
    }

    /**
     * Read metric from Redis
     */
    public MetricData readMetric(String key) {
        try {
            String jsonValue = redisTemplate.opsForValue().get(key);
            if (jsonValue == null) {
                return null;
            }
            
            return deserializeMetric(jsonValue);
            
        } catch (Exception e) {
            log.error("Failed to read metric from Redis: {}", key, e);
            return null;
        }
    }

    /**
     * Get all metric keys matching pattern
     */
    public List<String> getMetricKeys(String pattern) {
        try {
            return redisTemplate.keys(pattern).stream().toList();
        } catch (Exception e) {
            log.error("Failed to get metric keys for pattern: {}", pattern, e);
            return List.of();
        }
    }

    /**
     * Get metrics for service and time range
     */
    public Map<String, MetricData> getMetrics(String service, String timePattern) {
        Map<String, MetricData> result = new HashMap<>();
        
        try {
            String pattern = String.format("metrics:%s:*:%s", service, timePattern);
            List<String> keys = getMetricKeys(pattern);
            
            for (String key : keys) {
                MetricData metric = readMetric(key);
                if (metric != null) {
                    result.put(key, metric);
                }
            }
            
            log.debug("Retrieved {} metrics for service {} with pattern {}", 
                    result.size(), service, timePattern);
                    
        } catch (Exception e) {
            log.error("Failed to get metrics for service {} with pattern {}", 
                    service, timePattern, e);
        }
        
        return result;
    }

    /**
     * Check Redis connectivity and TTL functionality
     */
    public boolean healthCheck() {
        try {
            String testKey = "metrics:health:test:" + System.currentTimeMillis();
            String testValue = "health-check";
            
            // Write test value with short TTL
            redisTemplate.opsForValue().set(testKey, testValue, Duration.ofSeconds(10));
            
            // Read it back
            String retrieved = redisTemplate.opsForValue().get(testKey);
            
            // Check TTL
            Long ttl = redisTemplate.getExpire(testKey);
            
            boolean success = testValue.equals(retrieved) && ttl != null && ttl > 0;
            
            if (success) {
                // Clean up test key
                redisTemplate.delete(testKey);
            }
            
            return success;
            
        } catch (Exception e) {
            log.error("Redis health check failed", e);
            return false;
        }
    }

    /**
     * Get statistics about stored metrics
     */
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            String pattern = properties.getKeyPrefix() + ":*";
            List<String> allKeys = getMetricKeys(pattern);
            
            stats.put("totalKeys", allKeys.size());
            stats.put("keyPrefix", properties.getKeyPrefix());
            stats.put("ttl", properties.getTtl().toString());
            stats.put("serviceName", properties.getServiceName());
            
            // Count by metric type
            Map<String, Integer> typeCount = new HashMap<>();
            for (String key : allKeys) {
                String[] parts = key.split(":");
                if (parts.length >= 3) {
                    String metricType = parts[2];
                    typeCount.merge(metricType, 1, Integer::sum);
                }
            }
            stats.put("metricTypeCounts", typeCount);
            
        } catch (Exception e) {
            log.error("Failed to get metrics statistics", e);
            stats.put("error", e.getMessage());
        }
        
        return stats;
    }

    private String serializeMetric(MetricData metric) throws Exception {
        // Create simplified JSON structure for Redis storage
        Map<String, Object> data = new HashMap<>();
        data.put("service", metric.getService());
        data.put("type", metric.getType().getMetricName());
        data.put("timestamp", metric.getTimestamp().toString());
        data.put("value", metric.getValue());
        
        if (metric.getSamples() != null && !metric.getSamples().isEmpty()) {
            data.put("sampleCount", metric.getSamples().size());
            // Don't store all samples to save space, just the count and value
        }
        
        if (metric.getMetadata() != null) {
            data.put("metadata", metric.getMetadata());
        }
        
        return objectMapper.writeValueAsString(data);
    }

    private MetricData deserializeMetric(String jsonValue) throws Exception {
        @SuppressWarnings("unchecked")
        Map<String, Object> data = objectMapper.readValue(jsonValue, Map.class);
        
        return MetricData.builder()
                .service((String) data.get("service"))
                .type(org.aquastream.common.metrics.model.MetricType.valueOf(
                        ((String) data.get("type")).toUpperCase().replace("_", "_")))
                .timestamp(java.time.LocalDateTime.parse((String) data.get("timestamp")))
                .value(((Number) data.get("value")).doubleValue())
                .metadata((String) data.get("metadata"))
                .build();
    }
}