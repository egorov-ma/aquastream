package org.aquastream.user.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Запрос на регистрацию нового пользователя")
public class SignupRequest {
    @NotBlank
    @Size(min = 3, max = 50)
    @Schema(description = "Полное имя пользователя", example = "Иван Иванов")
    private String name;
    
    @NotBlank
    @Size(min = 3, max = 20)
    @Schema(description = "Логин пользователя (уникальный идентификатор для входа)", example = "john_doe")
    private String username;
    
    @NotBlank
    @Size(min = 6, max = 40)
    @Schema(description = "Пароль пользователя", example = "<password>")
    private String password;
    
    @Schema(description = "Имя пользователя в Telegram без символа @", example = "ivan_ivanov")
    private String telegramUser;
    
    @Schema(description = "Номер телефона пользователя", example = "+7(999)123-45-67")
    private String phone;
    
    @Schema(description = "Роль пользователя (только для административных запросов)", example = "user", allowableValues = {"user", "admin", "organizer"})
    private String role;
} 