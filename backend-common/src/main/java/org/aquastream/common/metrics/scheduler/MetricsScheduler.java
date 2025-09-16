package org.aquastream.common.metrics.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.common.metrics.collector.MetricsCollector;
import org.aquastream.common.metrics.config.MetricsProperties;
import org.aquastream.common.metrics.model.MetricData;
import org.aquastream.common.metrics.writer.RedisMetricsWriter;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Scheduler for periodic flushing of metrics to Redis
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MetricsScheduler {

    private final MetricsCollector metricsCollector;
    private final RedisMetricsWriter redisWriter;
    private final MetricsProperties properties;

    private final AtomicBoolean started = new AtomicBoolean(false);
    private final AtomicLong flushCount = new AtomicLong(0);
    private final AtomicLong lastFlushTime = new AtomicLong(0);
    private final AtomicLong totalMetricsFlushed = new AtomicLong(0);

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        if (properties.isEnabled()) {
            started.set(true);
            log.info("Metrics scheduler started for service: {}", properties.getServiceName());
            log.info("Flush interval: {}, TTL: {}", properties.getFlushInterval(), properties.getTtl());
        } else {
            log.info("Metrics collection is disabled");
        }
    }

    /**
     * Scheduled flush of metrics every minute
     */
    @Scheduled(fixedRateString = "#{@metricsProperties.flushInterval.toMillis()}")
    public void flushMetrics() {
        if (!started.get() || !properties.isEnabled()) {
            return;
        }

        try {
            long startTime = System.currentTimeMillis();
            
            // Get metrics from collector
            List<MetricData> metrics = metricsCollector.flushMetrics();
            
            if (!metrics.isEmpty()) {
                // Write to Redis
                redisWriter.writeMetrics(metrics);
                
                // Update statistics
                long flushNumber = flushCount.incrementAndGet();
                lastFlushTime.set(startTime);
                totalMetricsFlushed.addAndGet(metrics.size());
                
                long duration = System.currentTimeMillis() - startTime;
                
                log.debug("Flush #{}: wrote {} metrics to Redis in {}ms", 
                        flushNumber, metrics.size(), duration);
                        
                // Log detailed metrics in trace level
                if (log.isTraceEnabled()) {
                    for (MetricData metric : metrics) {
                        log.trace("Flushed metric: {} = {}", metric.getRedisKey(), metric.getValue());
                    }
                }
            } else {
                log.trace("No metrics to flush");
            }

        } catch (Exception e) {
            log.error("Error during metrics flush", e);
        }
    }

    /**
     * Health check for metrics system
     */
    @Scheduled(fixedRateString = "#{@metricsProperties.flushInterval.toMillis() * 5}")
    public void healthCheck() {
        if (!started.get() || !properties.isEnabled()) {
            return;
        }

        try {
            // Check Redis connectivity
            boolean redisHealthy = redisWriter.healthCheck();
            
            if (!redisHealthy) {
                log.warn("Redis health check failed for metrics");
            }
            
            // Log current state
            if (log.isDebugEnabled()) {
                var collectorState = metricsCollector.getCurrentState();
                log.debug("Metrics health check - Redis: {}, Collector state: {}", 
                        redisHealthy ? "OK" : "FAIL", collectorState);
            }

        } catch (Exception e) {
            log.error("Error during metrics health check", e);
        }
    }

    /**
     * Get scheduler statistics
     */
    public MetricsSchedulerStats getStatistics() {
        return new MetricsSchedulerStats(
                started.get(),
                flushCount.get(),
                lastFlushTime.get(),
                totalMetricsFlushed.get(),
                properties.getServiceName(),
                properties.isEnabled()
        );
    }

    /**
     * Manual flush trigger (for testing/debugging)
     */
    public void manualFlush() {
        if (!properties.isEnabled()) {
            log.warn("Cannot manually flush - metrics collection is disabled");
            return;
        }

        log.info("Manual metrics flush triggered");
        flushMetrics();
    }

    /**
     * Statistics record for the scheduler
     */
    public record MetricsSchedulerStats(
            boolean started,
            long flushCount,
            long lastFlushTime,
            long totalMetricsFlushed,
            String serviceName,
            boolean enabled
    ) {}
}