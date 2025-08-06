package org.aquastream.event.grpc.exception;

import io.grpc.ForwardingServerCallListener;
import io.grpc.Metadata;
import io.grpc.ServerCall;
import io.grpc.ServerCallHandler;
import io.grpc.ServerInterceptor;
import io.grpc.Status;
import net.devh.boot.grpc.server.interceptor.GrpcGlobalServerInterceptor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.validation.ConstraintViolationException;

@Component
@GrpcGlobalServerInterceptor
@Order(100) // Выполняется после ValidationInterceptor
public class GrpcExceptionHandler implements ServerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(GrpcExceptionHandler.class);

    @Override
    public <ReqT, RespT> ServerCall.Listener<ReqT> interceptCall(
            ServerCall<ReqT, RespT> call, Metadata headers, ServerCallHandler<ReqT, RespT> next) {

        return new ExceptionHandlingListener<>(next.startCall(call, headers), call, headers);
    }

    private static class ExceptionHandlingListener<ReqT> extends ForwardingServerCallListener.SimpleForwardingServerCallListener<ReqT> {
        private final ServerCall<?, ?> call;
        private final Metadata headers;
        private static final Logger logger = LoggerFactory.getLogger(ExceptionHandlingListener.class);

        public ExceptionHandlingListener(ServerCall.Listener<ReqT> delegate, ServerCall<?, ?> call, Metadata headers) {
            super(delegate);
            this.call = call;
            this.headers = headers;
        }

        @Override
        public void onMessage(ReqT message) {
            try {
                super.onMessage(message);
            } catch (Exception e) {
                handleException(e);
            }
        }

        @Override
        public void onHalfClose() {
            try {
                super.onHalfClose();
            } catch (Exception e) {
                handleException(e);
            }
        }

        private void handleException(Exception e) {
            Status status;
            String description;

            if (e instanceof ConstraintViolationException) {
                ConstraintViolationException cve = (ConstraintViolationException) e;
                StringBuilder errorMessage = new StringBuilder("Validation failed: ");
                cve.getConstraintViolations().forEach(violation -> 
                    errorMessage.append(violation.getPropertyPath())
                               .append(" ")
                               .append(violation.getMessage())
                               .append("; "));
                
                status = Status.INVALID_ARGUMENT;
                description = errorMessage.toString();
                logger.warn("Validation error in gRPC call: {}", description);
            } else if (e instanceof IllegalArgumentException) {
                status = Status.INVALID_ARGUMENT;
                description = "Invalid argument: " + e.getMessage();
                logger.warn("Invalid argument in gRPC call: {}", description);
            } else if (e instanceof RuntimeException) {
                status = Status.INTERNAL;
                description = "Internal server error";
                logger.error("Unexpected error in gRPC call", e);
            } else {
                status = Status.UNKNOWN;
                description = "Unknown error occurred";
                logger.error("Unknown error in gRPC call", e);
            }

            call.close(status.withDescription(description), new Metadata());
        }
    }
}