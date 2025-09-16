package org.aquastream.common.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = ServiceUrlsTest.TestConfig.class)
@TestPropertySource(properties = {
    "app.services.user.base-url=http://test-user:8101",
    "app.services.event.connection-timeout=3000",
    "app.services.payment.health-check-enabled=false"
})
class ServiceUrlsTest {

    @EnableConfigurationProperties(ServiceUrls.class)
    static class TestConfig {
    }

    @Test
    void testDefaultConfiguration() {
        ServiceUrls serviceUrls = new ServiceUrls();
        
        // Test default values
        assertEquals("http://localhost:8101", serviceUrls.getUser().getBaseUrl());
        assertEquals("http://localhost:8102", serviceUrls.getEvent().getBaseUrl());
        assertEquals("/actuator/health", serviceUrls.getPayment().getHealthPath());
        assertEquals(5000, serviceUrls.getNotification().getConnectionTimeout());
        assertEquals(10000, serviceUrls.getMedia().getReadTimeout());
        assertTrue(serviceUrls.getCrew().isHealthCheckEnabled());
    }

    @Test
    void testHealthUrl() {
        ServiceUrls.ServiceConfig config = new ServiceUrls.ServiceConfig("http://test-service:8080");
        config.setHealthPath("/custom/health");
        
        assertEquals("http://test-service:8080/custom/health", config.getHealthUrl());
    }

    @Test
    void testServiceConfigBuilder() {
        ServiceUrls.ServiceConfig config = new ServiceUrls.ServiceConfig();
        config.setBaseUrl("http://example.com:9000");
        config.setConnectionTimeout(2000);
        config.setReadTimeout(15000);
        config.setHealthCheckEnabled(false);
        
        assertEquals("http://example.com:9000", config.getBaseUrl());
        assertEquals(2000, config.getConnectionTimeout());
        assertEquals(15000, config.getReadTimeout());
        assertFalse(config.isHealthCheckEnabled());
        assertEquals("http://example.com:9000/actuator/health", config.getHealthUrl());
    }
}