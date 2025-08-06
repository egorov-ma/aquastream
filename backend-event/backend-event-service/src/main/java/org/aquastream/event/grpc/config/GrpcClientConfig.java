package org.aquastream.event.grpc.config;

import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.aquastream.event.grpc.EventServiceGrpc;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GrpcClientConfig {

    @Value("${grpc.server.port:9090}")
    private int grpcServerPort;

    @Bean
    public ManagedChannel grpcChannel() {
        return ManagedChannelBuilder.forAddress("localhost", grpcServerPort)
                .usePlaintext()
                .build();
    }

    @Bean
    public EventServiceGrpc.EventServiceStub eventServiceStub(ManagedChannel channel) {
        return EventServiceGrpc.newStub(channel);
    }

    @Bean
    public EventServiceGrpc.EventServiceBlockingStub eventServiceBlockingStub(ManagedChannel channel) {
        return EventServiceGrpc.newBlockingStub(channel);
    }
}