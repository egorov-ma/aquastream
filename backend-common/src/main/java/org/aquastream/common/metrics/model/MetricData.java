package org.aquastream.common.metrics.model;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Aggregated metric data for a specific minute
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetricData {

    /**
     * Service name
     */
    private String service;

    /**
     * Metric type
     */
    private MetricType type;

    /**
     * Timestamp (minute precision)
     */
    private LocalDateTime timestamp;

    /**
     * Aggregated value
     */
    private Double value;

    /**
     * Raw samples (for percentile calculations)
     */
    private List<Double> samples;

    /**
     * Additional metadata
     */
    private String metadata;

    /**
     * Get Redis key for this metric
     */
    public String getRedisKey() {
        String timestampStr = timestamp.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmm"));
        return String.format("metrics:%s:%s:%s", service, type.getMetricName(), timestampStr);
    }

    /**
     * Create a counter metric (requests_total, errors_total)
     */
    public static MetricData counter(String service, MetricType type, LocalDateTime timestamp, long count) {
        return MetricData.builder()
                .service(service)
                .type(type)
                .timestamp(timestamp)
                .value((double) count)
                .build();
    }

    /**
     * Create a percentile metric (latency_p95_ms)
     */
    public static MetricData percentile(String service, MetricType type, LocalDateTime timestamp, 
                                      double percentileValue, List<Double> samples) {
        return MetricData.builder()
                .service(service)
                .type(type)
                .timestamp(timestamp)
                .value(percentileValue)
                .samples(samples)
                .build();
    }
}