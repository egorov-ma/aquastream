package org.aquastream.notification.api;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"org.aquastream.notification", "org.aquastream.common"})
@OpenAPIDefinition(
    info = @Info(
        title = "AquaStream Notification Service API",
        version = "1.0",
        description = "Notification management, Telegram bot and user preferences",
        contact = @Contact(name = "AquaStream Team", email = "support@aquastream.org")
    ),
    servers = {
        @Server(url = "http://localhost:8105", description = "Development server")
    }
)
public class NotificationApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(NotificationApiApplication.class, args);
    }
}


