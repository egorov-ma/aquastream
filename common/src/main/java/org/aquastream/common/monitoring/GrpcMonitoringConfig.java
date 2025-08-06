package org.aquastream.common.monitoring;

import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.binder.MeterBinder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.actuate.autoconfigure.metrics.MeterRegistryCustomizer;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.lang.management.ManagementFactory;
import java.lang.management.ThreadMXBean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Конфигурация мониторинга gRPC сервисов.
 * Настраивает дополнительные метрики и теги для gRPC сервисов.
 */
@Configuration
@ConditionalOnProperty(name = "aquastream.monitoring.grpc.enabled", havingValue = "true", matchIfMissing = true)
public class GrpcMonitoringConfig {

    private static final Logger logger = LoggerFactory.getLogger(GrpcMonitoringConfig.class);

    private final AtomicInteger activeConnections = new AtomicInteger(0);
    private final AtomicLong totalConnections = new AtomicLong(0);

    @Bean
    public MeterRegistryCustomizer<MeterRegistry> grpcMeterRegistryCustomizer() {
        return registry -> {
            // Добавляем общие теги для всех gRPC метрик
            registry.config().commonTags(
                "protocol", "grpc",
                "system", "aquastream"
            );
            
            logger.info("gRPC metrics customizer configured with common tags");
        };
    }

    @Bean
    public MeterBinder grpcSystemMetrics() {
        return (MeterRegistry registry) -> {
            ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
            
            // Метрики активных соединений
            Gauge.builder("grpc_active_connections")
                    .description("Number of active gRPC connections")
                    .register(registry, activeConnections, AtomicInteger::get);
            
            // Метрики общего количества соединений
            Gauge.builder("grpc_total_connections")
                    .description("Total number of gRPC connections established")
                    .register(registry, totalConnections, AtomicLong::get);
            
            // Метрики потоков для gRPC
            Gauge.builder("grpc_thread_pool_active")
                    .description("Number of active threads in gRPC thread pool")
                    .register(registry, threadBean, bean -> {
                        // Приблизительная оценка активных потоков gRPC
                        return (double) bean.getThreadCount();
                    });
            
            // Метрики памяти для gRPC буферов
            Gauge.builder("grpc_memory_usage_bytes")
                    .description("Estimated memory usage by gRPC buffers")
                    .register(registry, Runtime.getRuntime(), runtime -> {
                        // Приблизительная оценка использования памяти
                        return (double) (runtime.totalMemory() - runtime.freeMemory());
                    });
            
            logger.info("gRPC system metrics registered");
        };
    }

    /**
     * Компонент для отслеживания соединений gRPC
     */
    @Bean
    public GrpcConnectionTracker grpcConnectionTracker() {
        return new GrpcConnectionTracker(activeConnections, totalConnections);
    }

    /**
     * Трекер соединений для gRPC сервера
     */
    public static class GrpcConnectionTracker {
        private final AtomicInteger activeConnections;
        private final AtomicLong totalConnections;
        private static final Logger logger = LoggerFactory.getLogger(GrpcConnectionTracker.class);

        public GrpcConnectionTracker(AtomicInteger activeConnections, AtomicLong totalConnections) {
            this.activeConnections = activeConnections;
            this.totalConnections = totalConnections;
        }

        public void onConnectionOpened() {
            int active = activeConnections.incrementAndGet();
            long total = totalConnections.incrementAndGet();
            logger.debug("gRPC connection opened. Active: {}, Total: {}", active, total);
        }

        public void onConnectionClosed() {
            int active = activeConnections.decrementAndGet();
            logger.debug("gRPC connection closed. Active connections: {}", active);
        }

        public int getActiveConnections() {
            return activeConnections.get();
        }

        public long getTotalConnections() {
            return totalConnections.get();
        }
    }
}