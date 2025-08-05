package org.aquastream.user.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

/**
 * Конфигурация OpenAPI (Swagger) для документации API
 */
@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Aquastream User Service API",
                description = "API сервиса управления пользователями и аутентификации для проекта Aquastream.",
                version = "1.0.0",
                contact = @Contact(
                        name = "Команда разработки Aquastream",
                        email = "dev@aquastream.org"
                ),
                license = @License(
                        name = "MIT License",
                        url = "https://opensource.org/licenses/MIT"
                )
        ),
        servers = {
                @Server(
                        url = "http://localhost:8081",
                        description = "Локальный сервер разработки"
                ),
                @Server(
                        url = "https://api.aquastream.org",
                        description = "Продакшн сервер"
                )
        }
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        description = "JWT токен авторизации. Получите токен через /api/auth/login и используйте его в заголовке Authorization: Bearer {token}"
)
public class OpenApiConfig {
    // Конфигурация через аннотации, дополнительный код не требуется
} 