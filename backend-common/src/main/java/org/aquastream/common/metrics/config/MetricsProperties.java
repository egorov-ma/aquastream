package org.aquastream.common.metrics.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Data
@Component
@ConfigurationProperties(prefix = "aquastream.metrics")
public class MetricsProperties {

    /**
     * Service name for metrics keys
     */
    private String serviceName = "unknown";

    /**
     * TTL for metric keys in Redis (default 48 hours)
     */
    private Duration ttl = Duration.ofHours(48);

    /**
     * Flush interval for aggregated metrics (default 1 minute)
     */
    private Duration flushInterval = Duration.ofMinutes(1);

    /**
     * Enable/disable metrics collection
     */
    private boolean enabled = true;

    /**
     * Key prefix for Redis metrics
     */
    private String keyPrefix = "metrics";

    /**
     * Percentiles to calculate for latency metrics
     */
    private double[] percentiles = {0.95};

    /**
     * Maximum number of samples to keep for percentile calculation
     */
    private int maxSamples = 10000;
}