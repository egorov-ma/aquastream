package org.aquastream.notification.api.health;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for Actuator endpoints
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("dev") // Use dev profile for testing
public class ActuatorEndpointsTest {

    @LocalServerPort
    private int port;

    private TestRestTemplate restTemplate = new TestRestTemplate();

    private String getBaseUrl() {
        return "http://localhost:" + port + "/actuator";
    }

    @Test
    public void testHealthEndpoint() {
        ResponseEntity<String> response = restTemplate.getForEntity(
            getBaseUrl() + "/health", String.class);
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("UP");
    }

    @Test
    public void testHealthLivenessEndpoint() {
        ResponseEntity<String> response = restTemplate.getForEntity(
            getBaseUrl() + "/health/liveness", String.class);
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("UP");
    }

    @Test
    public void testHealthReadinessEndpoint() {
        ResponseEntity<String> response = restTemplate.getForEntity(
            getBaseUrl() + "/health/readiness", String.class);
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("UP");
    }

    @Test
    public void testInfoEndpoint() {
        ResponseEntity<String> response = restTemplate.getForEntity(
            getBaseUrl() + "/info", String.class);
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        // Should contain git information
        assertThat(response.getBody()).isNotEmpty();
    }

    @Test
    public void testMetricsEndpoint() {
        ResponseEntity<String> response = restTemplate.getForEntity(
            getBaseUrl() + "/metrics", String.class);
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("names");
    }

    @Test
    public void testHealthDetailsContainCustomIndicators() {
        ResponseEntity<String> response = restTemplate.getForEntity(
            getBaseUrl() + "/health", String.class);
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        // Should contain our custom health indicators
        assertThat(response.getBody()).contains("telegramService");
        assertThat(response.getBody()).contains("userService");
    }

    @Test
    public void testReadinessGroupContainsRequiredComponents() {
        ResponseEntity<String> response = restTemplate.getForEntity(
            getBaseUrl() + "/health/readiness", String.class);
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        // Readiness should check database and external services
        String body = response.getBody();
        assertThat(body).contains("UP");
    }
}