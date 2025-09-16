package org.aquastream.crew.api;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "org.aquastream.crew")
@EntityScan(basePackages = "org.aquastream.crew.db.entity")
@EnableJpaRepositories(basePackages = "org.aquastream.crew.db.repository")
@OpenAPIDefinition(
    info = @Info(
        title = "AquaStream Crew Service API",
        version = "1.0",
        description = "Crew management, boat and tent assignments",
        contact = @Contact(name = "AquaStream Team", email = "support@aquastream.org")
    ),
    servers = {
        @Server(url = "http://localhost:8103", description = "Development server")
    }
)
public class CrewApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(CrewApiApplication.class, args);
    }
}