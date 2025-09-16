package org.aquastream.event.api;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "org.aquastream.event")
@EntityScan(basePackages = "org.aquastream.event.db.entity")
@EnableJpaRepositories(basePackages = "org.aquastream.event.db.repository")
@EnableScheduling
@EnableAsync
@OpenAPIDefinition(
    info = @Info(
        title = "AquaStream Event Service API",
        version = "1.0",
        description = "Event management, bookings, favorites and organizer services",
        contact = @Contact(name = "AquaStream Team", email = "support@aquastream.org")
    ),
    servers = {
        @Server(url = "http://localhost:8102", description = "Development server")
    }
)
public class EventApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(EventApiApplication.class, args);
    }
}