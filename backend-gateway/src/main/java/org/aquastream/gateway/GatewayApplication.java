package org.aquastream.gateway;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"org.aquastream.gateway", "org.aquastream.common"})
@OpenAPIDefinition(
    info = @Info(
        title = "AquaStream API Gateway",
        version = "1.0",
        description = "Main gateway for routing requests to microservices",
        contact = @Contact(name = "AquaStream Team", email = "support@aquastream.org")
    ),
    servers = {
        @Server(url = "http://localhost:8080", description = "Development server")
    }
)
public class GatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
}


