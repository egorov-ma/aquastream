package org.aquastream.common.monitoring;

import io.grpc.ForwardingServerCall;
import io.grpc.ForwardingServerCallListener;
import io.grpc.Metadata;
import io.grpc.ServerCall;
import io.grpc.ServerCallHandler;
import io.grpc.ServerInterceptor;
import io.grpc.Status;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import net.devh.boot.grpc.server.interceptor.GrpcGlobalServerInterceptor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.TimeUnit;

/**
 * gRPC сервер интерцептор для сбора метрик производительности и вызовов.
 * Собирает метрики времени выполнения, количество вызовов и ошибок для каждого gRPC метода.
 */
@Component
@GrpcGlobalServerInterceptor
@Order(10) // Выполняется после CorrelationIdInterceptor но до ValidationInterceptor
public class GrpcMetricsInterceptor implements ServerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(GrpcMetricsInterceptor.class);

    private final MeterRegistry meterRegistry;
    private final Counter totalCallsCounter;
    private final Timer callDurationTimer;
    
    public GrpcMetricsInterceptor(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        this.totalCallsCounter = Counter.builder("grpc_server_calls_total")
                .description("Total number of gRPC calls")
                .register(meterRegistry);
        this.callDurationTimer = Timer.builder("grpc_server_call_duration")
                .description("Duration of gRPC calls")
                .register(meterRegistry);
    }

    @Override
    public <ReqT, RespT> ServerCall.Listener<ReqT> interceptCall(
            ServerCall<ReqT, RespT> call,
            Metadata headers,
            ServerCallHandler<ReqT, RespT> next) {

        String methodName = call.getMethodDescriptor().getFullMethodName();
        String serviceName = extractServiceName(methodName);
        String method = extractMethodName(methodName);
        
        Instant startTime = Instant.now();
        
        logger.debug("Starting gRPC call: service={}, method={}", serviceName, method);
        
        // Увеличиваем счетчик вызовов
        Counter.builder("grpc_server_started_total")
                .tag("service", serviceName)
                .tag("method", method)
                .description("Total number of gRPC calls started")
                .register(meterRegistry)
                .increment();

        ServerCall<ReqT, RespT> monitoredCall = new ForwardingServerCall.SimpleForwardingServerCall<ReqT, RespT>(call) {
            @Override
            public void close(Status status, Metadata trailers) {
                Duration duration = Duration.between(startTime, Instant.now());
                
                // Записываем метрики завершения вызова
                String statusCode = status.getCode().name();
                
                Counter.builder("grpc_server_completed_total")
                        .tag("service", serviceName)
                        .tag("method", method)
                        .tag("status", statusCode)
                        .description("Total number of gRPC calls completed")
                        .register(meterRegistry)
                        .increment();
                
                Timer.builder("grpc_server_duration_seconds")
                        .tag("service", serviceName)
                        .tag("method", method)
                        .tag("status", statusCode)
                        .description("Duration of gRPC calls in seconds")
                        .register(meterRegistry)
                        .record(duration.toNanos(), TimeUnit.NANOSECONDS);
                
                // Отдельные метрики для ошибок
                if (!status.isOk()) {
                    Counter.builder("grpc_server_errors_total")
                            .tag("service", serviceName)
                            .tag("method", method)
                            .tag("status", statusCode)
                            .tag("error", status.getCode().name())
                            .description("Total number of gRPC errors")
                            .register(meterRegistry)
                            .increment();
                    
                    logger.warn("gRPC call failed: service={}, method={}, status={}, duration={}ms", 
                               serviceName, method, statusCode, duration.toMillis());
                } else {
                    logger.debug("gRPC call completed: service={}, method={}, duration={}ms", 
                                serviceName, method, duration.toMillis());
                }
                
                super.close(status, trailers);
            }
        };

        return new MetricsServerCallListener<>(next.startCall(monitoredCall, headers), 
                                              serviceName, method, startTime, meterRegistry);
    }

    private String extractServiceName(String fullMethodName) {
        int lastSlash = fullMethodName.lastIndexOf('/');
        if (lastSlash > 0) {
            String fullServiceName = fullMethodName.substring(0, lastSlash);
            int lastDot = fullServiceName.lastIndexOf('.');
            return lastDot > 0 ? fullServiceName.substring(lastDot + 1) : fullServiceName;
        }
        return "unknown";
    }

    private String extractMethodName(String fullMethodName) {
        int lastSlash = fullMethodName.lastIndexOf('/');
        return lastSlash >= 0 ? fullMethodName.substring(lastSlash + 1) : fullMethodName;
    }

    private static class MetricsServerCallListener<ReqT> extends ForwardingServerCallListener.SimpleForwardingServerCallListener<ReqT> {
        private final String serviceName;
        private final String method;
        private final Instant startTime;
        private final MeterRegistry meterRegistry;

        protected MetricsServerCallListener(ServerCall.Listener<ReqT> delegate, 
                                          String serviceName, 
                                          String method, 
                                          Instant startTime,
                                          MeterRegistry meterRegistry) {
            super(delegate);
            this.serviceName = serviceName;
            this.method = method;
            this.startTime = startTime;
            this.meterRegistry = meterRegistry;
        }

        @Override
        public void onMessage(ReqT message) {
            // Считаем входящие сообщения
            Counter.builder("grpc_server_messages_received_total")
                    .tag("service", serviceName)
                    .tag("method", method)
                    .description("Total number of messages received")
                    .register(meterRegistry)
                    .increment();
            
            super.onMessage(message);
        }

        @Override
        public void onHalfClose() {
            // Отмечаем завершение получения сообщений от клиента
            super.onHalfClose();
        }

        @Override
        public void onCancel() {
            // Считаем отмененные вызовы
            Counter.builder("grpc_server_cancelled_total")
                    .tag("service", serviceName)
                    .tag("method", method)
                    .description("Total number of cancelled gRPC calls")
                    .register(meterRegistry)
                    .increment();
            
            super.onCancel();
        }
    }
}