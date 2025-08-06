package org.aquastream.common.logging;

import io.grpc.Context;
import io.grpc.Contexts;
import io.grpc.Metadata;
import io.grpc.ServerCall;
import io.grpc.ServerCallHandler;
import io.grpc.ServerInterceptor;
import net.devh.boot.grpc.server.interceptor.GrpcGlobalServerInterceptor;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@GrpcGlobalServerInterceptor
@Order(1) // Выполняется первым для установки correlation ID
public class CorrelationIdInterceptor implements ServerInterceptor {

    private static final Metadata.Key<String> CORRELATION_ID_KEY = 
            Metadata.Key.of("x-correlation-id", Metadata.ASCII_STRING_MARSHALLER);
    
    private static final Context.Key<String> CORRELATION_ID_CONTEXT_KEY = 
            Context.key("correlationId");

    @Override
    public <ReqT, RespT> ServerCall.Listener<ReqT> interceptCall(
            ServerCall<ReqT, RespT> call, 
            Metadata headers, 
            ServerCallHandler<ReqT, RespT> next) {

        String correlationId = extractCorrelationId(headers);
        
        // Устанавливаем correlation ID в контекст gRPC
        Context contextWithCorrelationId = Context.current()
                .withValue(CORRELATION_ID_CONTEXT_KEY, correlationId);
        
        // Устанавливаем correlation ID в MDC для логирования
        MDC.put(CorrelationIdFilter.CORRELATION_ID_MDC_KEY, correlationId);
        
        // Добавляем correlation ID в response headers
        Metadata responseHeaders = new Metadata();
        responseHeaders.put(CORRELATION_ID_KEY, correlationId);
        
        return Contexts.interceptCall(contextWithCorrelationId, call, headers, next);
    }

    private String extractCorrelationId(Metadata headers) {
        String correlationId = headers.get(CORRELATION_ID_KEY);
        if (correlationId == null || correlationId.trim().isEmpty()) {
            correlationId = UUID.randomUUID().toString();
        }
        return correlationId;
    }

    public static String getCurrentCorrelationId() {
        String correlationId = CORRELATION_ID_CONTEXT_KEY.get();
        if (correlationId == null) {
            correlationId = MDC.get(CorrelationIdFilter.CORRELATION_ID_MDC_KEY);
        }
        return correlationId;
    }
}