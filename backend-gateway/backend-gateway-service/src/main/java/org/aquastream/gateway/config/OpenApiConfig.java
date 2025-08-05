package org.aquastream.gateway.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.util.List;

/**
 * OpenAPI configuration for API Gateway
 * Aggregates all microservice APIs into a single documentation
 */
@Configuration
public class OpenApiConfig {

    @Bean
    @Primary
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("AquaStream API Gateway")
                        .description("Unified API documentation for all AquaStream microservices")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("AquaStream Team")
                                .email("support@aquastream.org"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("Local development server"),
                        new Server()
                                .url("https://api.aquastream.org")
                                .description("Production server")
                ));
    }

    @Bean
    public GroupedOpenApi gatewayApi() {
        return GroupedOpenApi.builder()
                .group("gateway")
                .displayName("API Gateway")
                .pathsToMatch("/api/gateway/**", "/actuator/**")
                .build();
    }

    @Bean
    public GroupedOpenApi userApi() {
        return GroupedOpenApi.builder()
                .group("user-service")
                .displayName("User Management API")
                .pathsToMatch("/api/auth/**", "/api/users/**")
                .build();
    }

    @Bean
    public GroupedOpenApi eventApi() {
        return GroupedOpenApi.builder()
                .group("event-service")
                .displayName("Event Management API")
                .pathsToMatch("/api/events/**")
                .build();
    }

    @Bean
    public GroupedOpenApi crewApi() {
        return GroupedOpenApi.builder()
                .group("crew-service")
                .displayName("Crew Management API")
                .pathsToMatch("/api/crews/**")
                .build();
    }

    @Bean
    public GroupedOpenApi notificationApi() {
        return GroupedOpenApi.builder()
                .group("notification-service")
                .displayName("Notification API")
                .pathsToMatch("/api/notifications/**")
                .build();
    }
}