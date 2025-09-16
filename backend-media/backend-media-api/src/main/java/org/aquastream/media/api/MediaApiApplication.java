package org.aquastream.media.api;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "org.aquastream")
@EntityScan(basePackages = "org.aquastream.media.db.entity")
@EnableJpaRepositories(basePackages = "org.aquastream.media.db.repository")
@EnableScheduling
@OpenAPIDefinition(
    info = @Info(
        title = "AquaStream Media Service API",
        version = "1.0",
        description = "Media upload, processing and management",
        contact = @Contact(name = "AquaStream Team", email = "support@aquastream.org")
    ),
    servers = {
        @Server(url = "http://localhost:8106", description = "Development server")
    }
)
public class MediaApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(MediaApiApplication.class, args);
    }
}