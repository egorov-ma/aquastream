package org.aquastream.event.grpc.interceptor;

import io.grpc.ForwardingServerCall;
import io.grpc.Metadata;
import io.grpc.ServerCall;
import io.grpc.ServerCallHandler;
import io.grpc.ServerInterceptor;
import io.grpc.Status;
import net.devh.boot.grpc.server.interceptor.GrpcGlobalServerInterceptor;
import org.springframework.stereotype.Component;

import javax.validation.ConstraintViolation;
import javax.validation.Validator;
import java.util.Set;

@Component
@GrpcGlobalServerInterceptor
public class ValidationInterceptor implements ServerInterceptor {

    private final Validator validator;

    public ValidationInterceptor(Validator validator) {
        this.validator = validator;
    }

    @Override
    public <ReqT, RespT> ServerCall.Listener<ReqT> interceptCall(
            ServerCall<ReqT, RespT> call, Metadata headers, ServerCallHandler<ReqT, RespT> next) {

        return new ForwardingServerCall.SimpleForwardingServerCall<ReqT, RespT>(call) {
            @Override
            public void sendMessage(RespT message) {
                super.sendMessage(message);
            }
        }.startCall(new ValidationListener<>(next.startCall(call, headers), validator), headers);
    }

    private static class ValidationListener<ReqT> extends ServerCall.Listener<ReqT> {
        private final ServerCall.Listener<ReqT> delegate;
        private final Validator validator;

        public ValidationListener(ServerCall.Listener<ReqT> delegate, Validator validator) {
            this.delegate = delegate;
            this.validator = validator;
        }

        @Override
        public void onMessage(ReqT message) {
            Set<ConstraintViolation<ReqT>> violations = validator.validate(message);
            if (!violations.isEmpty()) {
                StringBuilder errorMessage = new StringBuilder("Validation failed: ");
                for (ConstraintViolation<ReqT> violation : violations) {
                    errorMessage.append(violation.getPropertyPath())
                               .append(" ")
                               .append(violation.getMessage())
                               .append("; ");
                }
                throw Status.INVALID_ARGUMENT
                    .withDescription(errorMessage.toString())
                    .asRuntimeException();
            }
            delegate.onMessage(message);
        }

        @Override
        public void onHalfClose() {
            delegate.onHalfClose();
        }

        @Override
        public void onCancel() {
            delegate.onCancel();
        }

        @Override
        public void onComplete() {
            delegate.onComplete();
        }

        @Override
        public void onReady() {
            delegate.onReady();
        }
    }
}