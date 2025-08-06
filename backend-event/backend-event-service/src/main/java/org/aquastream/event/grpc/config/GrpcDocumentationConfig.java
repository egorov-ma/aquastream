package org.aquastream.event.grpc.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class GrpcDocumentationConfig {

    @Bean
    public OpenAPI eventServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("AquaStream Event Service gRPC API")
                        .description("gRPC API для управления событиями в системе AquaStream. " +
                                "Предоставляет операции создания, обновления и управления событиями.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("AquaStream Development Team")
                                .email("dev@aquastream.org")
                                .url("https://aquastream.org"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0.html")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8082")
                                .description("Local development server"),
                        new Server()
                                .url("http://localhost:9090")
                                .description("gRPC server (direct access)"),
                        new Server()
                                .url("https://api.aquastream.org")
                                .description("Production server")
                ));
    }
}