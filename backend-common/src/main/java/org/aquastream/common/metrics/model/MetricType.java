package org.aquastream.common.metrics.model;

/**
 * Types of metrics collected by the system
 */
public enum MetricType {
    
    /**
     * Total number of requests
     */
    REQUESTS_TOTAL("requests_total"),
    
    /**
     * Total number of errors
     */
    ERRORS_TOTAL("errors_total"),
    
    /**
     * 95th percentile latency in milliseconds
     */
    LATENCY_P95_MS("latency_p95_ms");

    private final String metricName;

    MetricType(String metricName) {
        this.metricName = metricName;
    }

    public String getMetricName() {
        return metricName;
    }

    @Override
    public String toString() {
        return metricName;
    }
}