package org.aquastream.common.monitoring;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.lang.management.ManagementFactory;
import java.lang.management.ThreadMXBean;
import java.util.HashMap;
import java.util.Map;

/**
 * Health Indicator для gRPC сервисов.
 * Проверяет состояние gRPC сервера и предоставляет детальную информацию о его работе.
 */
@Component("grpc")
@ConditionalOnProperty(name = "aquastream.monitoring.grpc.enabled", havingValue = "true", matchIfMissing = true)
public class GrpcHealthIndicator implements HealthIndicator {

    private static final Logger logger = LoggerFactory.getLogger(GrpcHealthIndicator.class);

    private final GrpcMonitoringConfig.GrpcConnectionTracker connectionTracker;
    private final ThreadMXBean threadBean;

    public GrpcHealthIndicator(GrpcMonitoringConfig.GrpcConnectionTracker connectionTracker) {
        this.connectionTracker = connectionTracker;
        this.threadBean = ManagementFactory.getThreadMXBean();
    }

    @Override
    public Health health() {
        try {
            Map<String, Object> details = new HashMap<>();
            
            // Информация о соединениях
            int activeConnections = connectionTracker.getActiveConnections();
            long totalConnections = connectionTracker.getTotalConnections();
            
            details.put("activeConnections", activeConnections);
            details.put("totalConnections", totalConnections);
            details.put("connectionStatus", activeConnections >= 0 ? "OK" : "ERROR");
            
            // Информация о потоках
            int threadCount = threadBean.getThreadCount();
            details.put("threadCount", threadCount);
            details.put("threadStatus", threadCount > 0 ? "OK" : "WARNING");
            
            // Информация о памяти
            Runtime runtime = Runtime.getRuntime();
            long totalMemory = runtime.totalMemory();
            long freeMemory = runtime.freeMemory();
            long usedMemory = totalMemory - freeMemory;
            double memoryUsagePercent = ((double) usedMemory / totalMemory) * 100;
            
            details.put("memoryUsedBytes", usedMemory);
            details.put("memoryTotalBytes", totalMemory);
            details.put("memoryUsagePercent", String.format("%.2f%%", memoryUsagePercent));
            
            // Определяем общее состояние
            Health.Builder healthBuilder;
            
            if (memoryUsagePercent > 90) {
                healthBuilder = Health.down()
                        .withDetail("reason", "High memory usage: " + String.format("%.2f%%", memoryUsagePercent));
                logger.warn("gRPC health check: HIGH memory usage {}%", String.format("%.2f", memoryUsagePercent));
            } else if (memoryUsagePercent > 80) {
                healthBuilder = Health.up()
                        .withDetail("warning", "High memory usage: " + String.format("%.2f%%", memoryUsagePercent));
                logger.info("gRPC health check: Elevated memory usage {}%", String.format("%.2f", memoryUsagePercent));
            } else {
                healthBuilder = Health.up()
                        .withDetail("status", "gRPC server is healthy");
                logger.debug("gRPC health check: OK, memory usage {}%", String.format("%.2f", memoryUsagePercent));
            }
            
            // Проверяем критические пороги
            if (activeConnections < 0) {
                healthBuilder = Health.down()
                        .withDetail("reason", "Invalid active connections count: " + activeConnections);
                logger.error("gRPC health check: Invalid active connections: {}", activeConnections);
            }
            
            if (threadCount <= 0) {
                healthBuilder = Health.down()
                        .withDetail("reason", "No active threads detected");
                logger.error("gRPC health check: No active threads detected");
            }
            
            // Добавляем детали и возвращаем результат
            return healthBuilder.withDetails(details).build();
            
        } catch (Exception e) {
            logger.error("gRPC health check failed", e);
            return Health.down()
                    .withException(e)
                    .withDetail("error", "Failed to check gRPC server health: " + e.getMessage())
                    .build();
        }
    }
}