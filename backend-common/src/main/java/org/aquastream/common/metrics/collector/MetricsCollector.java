package org.aquastream.common.metrics.collector;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.common.metrics.config.MetricsProperties;
import org.aquastream.common.metrics.model.MetricData;
import org.aquastream.common.metrics.model.MetricType;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Thread-safe collector for aggregating metrics within minute windows
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MetricsCollector {

    private final MetricsProperties properties;

    // Thread-safe counters for requests and errors
    private final Map<LocalDateTime, AtomicLong> requestCounts = new ConcurrentHashMap<>();
    private final Map<LocalDateTime, AtomicLong> errorCounts = new ConcurrentHashMap<>();
    
    // Thread-safe latency samples storage
    private final Map<LocalDateTime, List<Double>> latencySamples = new ConcurrentHashMap<>();

    /**
     * Record a request
     */
    public void recordRequest(long latencyMs, boolean isError) {
        if (!properties.isEnabled()) {
            return;
        }

        LocalDateTime currentMinute = getCurrentMinute();
        
        try {
            // Increment request counter
            requestCounts.computeIfAbsent(currentMinute, k -> new AtomicLong(0))
                         .incrementAndGet();
            
            // Increment error counter if needed
            if (isError) {
                errorCounts.computeIfAbsent(currentMinute, k -> new AtomicLong(0))
                          .incrementAndGet();
            }
            
            // Record latency sample
            recordLatencySample(currentMinute, latencyMs);
            
            log.trace("Recorded request: latency={}ms, error={}, minute={}", 
                    latencyMs, isError, currentMinute);
                    
        } catch (Exception e) {
            log.error("Error recording request metrics", e);
        }
    }

    /**
     * Record just latency (for custom timing)
     */
    public void recordLatency(long latencyMs) {
        if (!properties.isEnabled()) {
            return;
        }

        LocalDateTime currentMinute = getCurrentMinute();
        recordLatencySample(currentMinute, latencyMs);
    }

    /**
     * Record just an error
     */
    public void recordError() {
        if (!properties.isEnabled()) {
            return;
        }

        LocalDateTime currentMinute = getCurrentMinute();
        errorCounts.computeIfAbsent(currentMinute, k -> new AtomicLong(0))
                  .incrementAndGet();
    }

    /**
     * Get and clear all metrics for completed minutes
     */
    public List<MetricData> flushMetrics() {
        if (!properties.isEnabled()) {
            return Collections.emptyList();
        }

        LocalDateTime currentMinute = getCurrentMinute();
        List<MetricData> metrics = new ArrayList<>();

        try {
            // Process all completed minutes (not current one)
            Set<LocalDateTime> completedMinutes = new HashSet<>();
            completedMinutes.addAll(requestCounts.keySet());
            completedMinutes.addAll(errorCounts.keySet());
            completedMinutes.addAll(latencySamples.keySet());
            
            for (LocalDateTime minute : completedMinutes) {
                if (minute.isBefore(currentMinute)) {
                    metrics.addAll(createMetricsForMinute(minute));
                    cleanupMinute(minute);
                }
            }
            
            log.debug("Flushed {} metrics for {} completed minutes", 
                    metrics.size(), completedMinutes.size());
                    
        } catch (Exception e) {
            log.error("Error flushing metrics", e);
        }

        return metrics;
    }

    /**
     * Get current metrics state (for debugging)
     */
    public Map<String, Object> getCurrentState() {
        LocalDateTime currentMinute = getCurrentMinute();
        
        Map<String, Object> state = new HashMap<>();
        state.put("currentMinute", currentMinute);
        state.put("requestCount", requestCounts.getOrDefault(currentMinute, new AtomicLong(0)).get());
        state.put("errorCount", errorCounts.getOrDefault(currentMinute, new AtomicLong(0)).get());
        state.put("latencySampleCount", latencySamples.getOrDefault(currentMinute, new ArrayList<>()).size());
        Set<LocalDateTime> allMinutes = new HashSet<>();
        allMinutes.addAll(requestCounts.keySet());
        allMinutes.addAll(errorCounts.keySet());
        allMinutes.addAll(latencySamples.keySet());
        state.put("totalMinutesTracked", allMinutes.size());
        
        return state;
    }

    private LocalDateTime getCurrentMinute() {
        return LocalDateTime.now().truncatedTo(ChronoUnit.MINUTES);
    }

    private void recordLatencySample(LocalDateTime minute, double latencyMs) {
        List<Double> samples = latencySamples.computeIfAbsent(minute, 
                k -> new CopyOnWriteArrayList<>());
        
        // Limit sample size to prevent memory issues
        if (samples.size() < properties.getMaxSamples()) {
            samples.add(latencyMs);
        } else {
            // Replace random sample to maintain statistical validity
            int randomIndex = new Random().nextInt(samples.size());
            samples.set(randomIndex, latencyMs);
        }
    }

    private List<MetricData> createMetricsForMinute(LocalDateTime minute) {
        List<MetricData> metrics = new ArrayList<>();
        String serviceName = properties.getServiceName();

        // Requests total
        AtomicLong requestCount = requestCounts.get(minute);
        if (requestCount != null && requestCount.get() > 0) {
            metrics.add(MetricData.counter(serviceName, MetricType.REQUESTS_TOTAL, 
                                         minute, requestCount.get()));
        }

        // Errors total
        AtomicLong errorCount = errorCounts.get(minute);
        if (errorCount != null && errorCount.get() > 0) {
            metrics.add(MetricData.counter(serviceName, MetricType.ERRORS_TOTAL, 
                                         minute, errorCount.get()));
        }

        // Latency P95
        List<Double> samples = latencySamples.get(minute);
        if (samples != null && !samples.isEmpty()) {
            double p95 = calculatePercentile(samples, 0.95);
            metrics.add(MetricData.percentile(serviceName, MetricType.LATENCY_P95_MS, 
                                            minute, p95, new ArrayList<>(samples)));
        }

        return metrics;
    }

    private void cleanupMinute(LocalDateTime minute) {
        requestCounts.remove(minute);
        errorCounts.remove(minute);
        latencySamples.remove(minute);
    }

    private double calculatePercentile(List<Double> samples, double percentile) {
        if (samples.isEmpty()) {
            return 0.0;
        }

        List<Double> sorted = new ArrayList<>(samples);
        Collections.sort(sorted);
        
        int index = (int) Math.ceil(percentile * sorted.size()) - 1;
        index = Math.max(0, Math.min(index, sorted.size() - 1));
        
        return sorted.get(index);
    }
}