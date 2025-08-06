package org.aquastream.event.grpc.gateway;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.aquastream.event.grpc.EventRequest;
import org.aquastream.event.grpc.EventResponse;
import org.aquastream.event.grpc.EventServiceGrpc;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/v1/events")
@Tag(name = "Event Service", description = "REST API для управления событиями через gRPC")
public class EventGrpcGateway {

    private static final Logger logger = LoggerFactory.getLogger(EventGrpcGateway.class);
    private final EventServiceGrpc.EventServiceStub eventServiceStub;

    public EventGrpcGateway(EventServiceGrpc.EventServiceStub eventServiceStub) {
        this.eventServiceStub = eventServiceStub;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
        summary = "Создать новое событие",
        description = "Создает новое событие с указанными именем и описанием. " +
                     "Имя события обязательно и должно содержать от 1 до 255 символов. " +
                     "Описание необязательно, максимум 1000 символов."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200", 
            description = "Событие успешно создано",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = @Schema(implementation = EventResponseDto.class)
            )
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "Некорректные входные данные",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)
        ),
        @ApiResponse(
            responseCode = "500", 
            description = "Внутренняя ошибка сервера",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)
        )
    })
    public ResponseEntity<EventResponseDto> createEvent(
            @Valid @RequestBody EventRequestDto request) {
        
        try {
            logger.info("Received REST request to create event: {}", request.getName());
            
            EventRequest grpcRequest = EventRequest.newBuilder()
                .setName(request.getName())
                .setDescription(request.getDescription() != null ? request.getDescription() : "")
                .build();

            CompletableFuture<EventResponse> futureResponse = new CompletableFuture<>();
            
            eventServiceStub.createEvent(grpcRequest, new io.grpc.stub.StreamObserver<EventResponse>() {
                @Override
                public void onNext(EventResponse response) {
                    futureResponse.complete(response);
                }

                @Override
                public void onError(Throwable t) {
                    futureResponse.completeExceptionally(t);
                }

                @Override
                public void onCompleted() {
                    // Response already completed in onNext
                }
            });

            EventResponse grpcResponse = futureResponse.get(5, TimeUnit.SECONDS);
            
            EventResponseDto responseDto = new EventResponseDto(
                grpcResponse.getId(),
                grpcResponse.getStatus()
            );
            
            logger.info("Event created successfully via REST gateway with ID: {}", grpcResponse.getId());
            
            return ResponseEntity.ok(responseDto);
            
        } catch (Exception e) {
            logger.error("Error creating event via REST gateway", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // DTO классы для REST API
    @Schema(description = "Запрос на создание события")
    public static class EventRequestDto {
        
        @NotBlank(message = "Имя события обязательно")
        @Size(min = 1, max = 255, message = "Имя события должно содержать от 1 до 255 символов")
        @Schema(description = "Название события", example = "Конференция разработчиков", required = true)
        private String name;
        
        @Size(max = 1000, message = "Описание не должно превышать 1000 символов")
        @Schema(description = "Описание события", example = "Ежегодная конференция для разработчиков программного обеспечения")
        private String description;

        public EventRequestDto() {}

        public EventRequestDto(String name, String description) {
            this.name = name;
            this.description = description;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    @Schema(description = "Ответ при создании события")
    public static class EventResponseDto {
        
        @Schema(description = "Уникальный идентификатор события", example = "12345")
        private Long id;
        
        @Schema(description = "Статус события", example = "CREATED")
        private String status;

        public EventResponseDto() {}

        public EventResponseDto(Long id, String status) {
            this.id = id;
            this.status = status;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}