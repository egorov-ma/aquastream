package org.aquastream.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Информация о профиле пользователя")
public class UserProfileDto {
    @Schema(description = "Уникальный идентификатор пользователя", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Логин пользователя", example = "johnsmith")
    private String username;

    @Schema(description = "Полное имя пользователя", example = "Иван Иванов")
    private String name;

    @Schema(description = "Номер телефона пользователя", example = "+7(999)123-45-67")
    private String phone;

    @Schema(description = "Имя пользователя в Telegram (без @)", example = "ivan_ivanov")
    private String telegramUser;

    @Schema(description = "ID чата пользователя в Telegram для отправки уведомлений", example = "12345678")
    private String telegramChatId;

    @Schema(description = "Статус активности учетной записи пользователя", example = "true")
    private boolean active;

    @Schema(description = "Роль пользователя в системе", example = "ROLE_USER", allowableValues = {"ROLE_USER", "ROLE_ADMIN", "ROLE_ORGANIZER"})
    private String role;
} 