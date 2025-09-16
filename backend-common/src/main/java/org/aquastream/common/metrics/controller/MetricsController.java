package org.aquastream.common.metrics.controller;

import lombok.RequiredArgsConstructor;
import org.aquastream.common.metrics.collector.MetricsCollector;
import org.aquastream.common.metrics.config.MetricsProperties;
import org.aquastream.common.metrics.model.MetricData;
import org.aquastream.common.metrics.scheduler.MetricsScheduler;
import org.aquastream.common.metrics.writer.RedisMetricsWriter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for metrics monitoring and debugging
 */
@RestController
@RequestMapping("/actuator/metrics-debug")
@RequiredArgsConstructor
@ConditionalOnProperty(name = "aquastream.metrics.enabled", havingValue = "true", matchIfMissing = true)
public class MetricsController {

    private final MetricsCollector metricsCollector;
    private final RedisMetricsWriter redisWriter;
    private final MetricsScheduler scheduler;
    private final MetricsProperties properties;

    /**
     * Get current metrics collector state
     */
    @GetMapping("/collector/state")
    public ResponseEntity<Map<String, Object>> getCollectorState() {
        return ResponseEntity.ok(metricsCollector.getCurrentState());
    }

    /**
     * Get scheduler statistics
     */
    @GetMapping("/scheduler/stats")
    public ResponseEntity<MetricsScheduler.MetricsSchedulerStats> getSchedulerStats() {
        return ResponseEntity.ok(scheduler.getStatistics());
    }

    /**
     * Get Redis metrics statistics
     */
    @GetMapping("/redis/stats")
    public ResponseEntity<Map<String, Object>> getRedisStats() {
        return ResponseEntity.ok(redisWriter.getStatistics());
    }

    /**
     * Get metrics configuration
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("serviceName", properties.getServiceName());
        config.put("enabled", properties.isEnabled());
        config.put("ttl", properties.getTtl().toString());
        config.put("flushInterval", properties.getFlushInterval().toString());
        config.put("keyPrefix", properties.getKeyPrefix());
        config.put("maxSamples", properties.getMaxSamples());
        return ResponseEntity.ok(config);
    }

    /**
     * Trigger manual flush
     */
    @PostMapping("/flush")
    public ResponseEntity<Map<String, String>> manualFlush() {
        scheduler.manualFlush();
        return ResponseEntity.ok(Map.of("status", "Flush triggered"));
    }

    /**
     * Health check for metrics system
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        
        try {
            boolean redisHealth = redisWriter.healthCheck();
            var schedulerStats = scheduler.getStatistics();
            var collectorState = metricsCollector.getCurrentState();
            
            health.put("redis", redisHealth ? "UP" : "DOWN");
            health.put("scheduler", schedulerStats.started() ? "UP" : "DOWN");
            health.put("enabled", properties.isEnabled());
            health.put("lastFlush", schedulerStats.lastFlushTime());
            health.put("totalFlushed", schedulerStats.totalMetricsFlushed());
            health.put("currentMinuteMetrics", collectorState);
            
            boolean overall = redisHealth && schedulerStats.started() && properties.isEnabled();
            health.put("status", overall ? "UP" : "DOWN");
            
            return ResponseEntity.ok(health);
            
        } catch (Exception e) {
            health.put("status", "DOWN");
            health.put("error", e.getMessage());
            return ResponseEntity.status(500).body(health);
        }
    }

    /**
     * Get metrics for specific service and time pattern
     */
    @GetMapping("/data")
    public ResponseEntity<Map<String, Object>> getMetrics(
            @RequestParam(required = false) String service,
            @RequestParam(required = false) String timePattern) {
        
        String serviceToUse = service != null ? service : properties.getServiceName();
        String patternToUse = timePattern != null ? timePattern : "*";
        
        Map<String, MetricData> metricsData = redisWriter.getMetrics(serviceToUse, patternToUse);
        
        Map<String, Object> response = new HashMap<>();
        response.put("service", serviceToUse);
        response.put("timePattern", patternToUse);
        response.put("metrics", metricsData);
        response.put("count", metricsData.size());
        
        return ResponseEntity.ok(response);
    }
}