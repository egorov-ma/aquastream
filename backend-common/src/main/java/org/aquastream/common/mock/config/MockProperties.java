package org.aquastream.common.mock.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app.mocks")
public class MockProperties {

    /**
     * Enable/disable mocks globally
     */
    private boolean enabled = false;

    /**
     * Override mocks via header X-Use-Mocks
     */
    private boolean headerOverrideEnabled = true;

    /**
     * Header name for mock override
     */
    private String headerName = "X-Use-Mocks";

    /**
     * Allowed profiles for mock override
     */
    private String[] allowedProfiles = {"dev", "local", "test"};

    /**
     * Mock response delay range (for realistic testing)
     */
    private DelayConfig delay = new DelayConfig();

    @Data
    public static class DelayConfig {
        /**
         * Minimum delay in milliseconds
         */
        private long minMs = 10;

        /**
         * Maximum delay in milliseconds
         */
        private long maxMs = 100;

        /**
         * Enable random delays
         */
        private boolean enabled = true;
    }
}