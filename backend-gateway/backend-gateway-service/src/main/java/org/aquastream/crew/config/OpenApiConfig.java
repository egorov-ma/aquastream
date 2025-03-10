package org.aquastream.crew.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI crewServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Crew Service API")
                        .description("API для управления экипажами")
                        .version("1.0"));
    }
} 