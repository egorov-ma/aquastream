package org.aquastream.user.api;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = {"org.aquastream.user", "org.aquastream.common"})
@EnableScheduling
@OpenAPIDefinition(
    info = @Info(
        title = "AquaStream User Service API",
        version = "1.0",
        description = "User management, authentication and profile services",
        contact = @Contact(name = "AquaStream Team", email = "support@aquastream.org")
    ),
    servers = {
        @Server(url = "http://localhost:8101", description = "Development server")
    }
)
public class UserApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserApiApplication.class, args);
    }
}


