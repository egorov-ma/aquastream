package org.aquastream.event.grpc;

import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.aquastream.event.grpc.validation.EventValidationRules;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@GrpcService
@Service
public class EventServiceImpl extends EventServiceGrpc.EventServiceImplBase {

    private static final Logger logger = LoggerFactory.getLogger(EventServiceImpl.class);
    private final EventValidationRules validationRules;

    public EventServiceImpl(EventValidationRules validationRules) {
        this.validationRules = validationRules;
    }

    @Override
    public void createEvent(EventRequest request, StreamObserver<EventResponse> responseObserver) {
        try {
            logger.info("Received createEvent request for event: {}", request.getName());
            
            // Валидация входных данных с использованием ValidationRules
            validationRules.validateEventRequest(request.getName(), request.getDescription());
            
            logger.info("Validation passed for event: {}", request.getName());
            
            // Создание события (заглушка)
            long eventId = System.currentTimeMillis(); // Временная заглушка
            EventResponse response = EventResponse.newBuilder()
                .setId(eventId)
                .setStatus("CREATED")
                .build();
            
            logger.info("Event created successfully with ID: {}", eventId);
            
            responseObserver.onNext(response);
            responseObserver.onCompleted();
            
        } catch (IllegalArgumentException e) {
            logger.warn("Validation failed for createEvent: {}", e.getMessage());
            responseObserver.onError(io.grpc.Status.INVALID_ARGUMENT
                .withDescription(e.getMessage())
                .asRuntimeException());
        } catch (Exception e) {
            logger.error("Unexpected error in createEvent", e);
            responseObserver.onError(io.grpc.Status.INTERNAL
                .withDescription("Internal server error")
                .asRuntimeException());
        }
    }
}
