package org.aquastream.user.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "Запрос на аутентификацию пользователя")
public class LoginRequest {
    @NotBlank
    @Schema(description = "Логин пользователя", example = "john_doe", required = true)
    private String username;

    @NotBlank
    @Schema(description = "Пароль пользователя", example = "password123", required = true)
    private String password;
} 