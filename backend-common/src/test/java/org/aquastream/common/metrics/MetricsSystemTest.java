package org.aquastream.common.metrics;

import org.aquastream.common.metrics.collector.MetricsCollector;
import org.aquastream.common.metrics.config.MetricsProperties;
import org.aquastream.common.metrics.model.MetricData;
import org.aquastream.common.metrics.model.MetricType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test for metrics collection system
 */
class MetricsSystemTest {

    private MetricsCollector collector;
    private MetricsProperties properties;

    @BeforeEach
    void setUp() {
        properties = new MetricsProperties();
        properties.setServiceName("test-service");
        properties.setEnabled(true);
        properties.setMaxSamples(1000);
        
        collector = new MetricsCollector(properties);
    }

    @Test
    void testMetricsCollection() {
        // Record some metrics
        collector.recordRequest(100, false);
        collector.recordRequest(200, false);
        collector.recordRequest(300, true);
        collector.recordLatency(150);
        collector.recordError();

        // Check current state
        Map<String, Object> state = collector.getCurrentState();
        assertNotNull(state);
        assertEquals(3L, state.get("requestCount"));
        assertEquals(2L, state.get("errorCount"));
        assertEquals(4, state.get("latencySampleCount"));
    }

    @Test
    void testRedisKeyGeneration() {
        LocalDateTime timestamp = LocalDateTime.of(2025, 8, 17, 14, 30);
        
        MetricData requestsMetric = MetricData.counter("notification", MetricType.REQUESTS_TOTAL, timestamp, 150);
        assertEquals("metrics:notification:requests_total:202508171430", requestsMetric.getRedisKey());
        
        MetricData errorsMetric = MetricData.counter("notification", MetricType.ERRORS_TOTAL, timestamp, 5);
        assertEquals("metrics:notification:errors_total:202508171430", errorsMetric.getRedisKey());
        
        MetricData latencyMetric = MetricData.percentile("notification", MetricType.LATENCY_P95_MS, timestamp, 95.5, null);
        assertEquals("metrics:notification:latency_p95_ms:202508171430", latencyMetric.getRedisKey());
    }

    @Test
    void testMetricDataCreation() {
        LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.MINUTES);
        
        // Test counter metric
        MetricData counter = MetricData.counter("test", MetricType.REQUESTS_TOTAL, now, 100);
        assertNotNull(counter);
        assertEquals("test", counter.getService());
        assertEquals(MetricType.REQUESTS_TOTAL, counter.getType());
        assertEquals(100.0, counter.getValue());
        assertEquals(now, counter.getTimestamp());
        
        // Test percentile metric
        List<Double> samples = List.of(10.0, 20.0, 30.0, 40.0, 50.0);
        MetricData percentile = MetricData.percentile("test", MetricType.LATENCY_P95_MS, now, 47.0, samples);
        assertNotNull(percentile);
        assertEquals(47.0, percentile.getValue());
        assertEquals(samples, percentile.getSamples());
    }

    @Test
    void testFlushEmptyCollector() {
        // Flush without any data
        List<MetricData> metrics = collector.flushMetrics();
        assertTrue(metrics.isEmpty());
    }

    @Test
    void testDisabledMetrics() {
        properties.setEnabled(false);
        
        // Record metrics when disabled
        collector.recordRequest(100, false);
        collector.recordError();
        
        Map<String, Object> state = collector.getCurrentState();
        assertEquals(0L, state.get("requestCount"));
        assertEquals(0L, state.get("errorCount"));
        assertEquals(0, state.get("latencySampleCount"));
    }
}