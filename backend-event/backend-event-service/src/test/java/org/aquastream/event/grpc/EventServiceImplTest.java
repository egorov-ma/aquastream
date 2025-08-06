package org.aquastream.event.grpc;

import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import io.grpc.testing.GrpcServerRule;
import org.aquastream.event.grpc.validation.EventValidationRules;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class EventServiceImplTest {

    private EventServiceGrpc.EventServiceBlockingStub blockingStub;
    private EventValidationRules validationRules;
    private EventServiceImpl eventService;

    @BeforeEach
    void setUp() {
        validationRules = new EventValidationRules();
        eventService = new EventServiceImpl(validationRules);
    }

    @Test
    void createEvent_ValidRequest_Success() {
        EventRequest request = EventRequest.newBuilder()
            .setName("Test Event")
            .setDescription("Test Description")
            .build();

        assertDoesNotThrow(() -> {
            validationRules.validateEventRequest(request.getName(), request.getDescription());
        });
    }

    @Test
    void createEvent_EmptyName_ThrowsException() {
        EventRequest request = EventRequest.newBuilder()
            .setName("")
            .setDescription("Test Description")
            .build();

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            validationRules.validateEventRequest(request.getName(), request.getDescription());
        });

        assertTrue(exception.getMessage().contains("Event name is required"));
    }

    @Test
    void createEvent_NullName_ThrowsException() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            validationRules.validateEventRequest(null, "Test Description");
        });

        assertTrue(exception.getMessage().contains("Event name is required"));
    }

    @Test
    void createEvent_NameTooLong_ThrowsException() {
        String longName = "a".repeat(256); // Превышаем лимит в 255 символов
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            validationRules.validateEventRequest(longName, "Test Description");
        });

        assertTrue(exception.getMessage().contains("must not exceed 255 characters"));
    }

    @Test
    void createEvent_DescriptionTooLong_ThrowsException() {
        String longDescription = "a".repeat(1001); // Превышаем лимит в 1000 символов
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            validationRules.validateEventRequest("Valid Name", longDescription);
        });

        assertTrue(exception.getMessage().contains("must not exceed 1000 characters"));
    }

    @Test
    void createEvent_ValidName_Success() {
        String validName = "Valid Event Name";
        String validDescription = "Valid description";

        assertDoesNotThrow(() -> {
            validationRules.validateEventRequest(validName, validDescription);
        });
    }

    @Test
    void createEvent_NullDescription_Success() {
        String validName = "Valid Event Name";

        assertDoesNotThrow(() -> {
            validationRules.validateEventRequest(validName, null);
        });
    }

    @Test
    void createEvent_EmptyDescription_Success() {
        String validName = "Valid Event Name";

        assertDoesNotThrow(() -> {
            validationRules.validateEventRequest(validName, "");
        });
    }
}