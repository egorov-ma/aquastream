package org.aquastream.user.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO для обновления профиля пользователя
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {
    
    @NotBlank(message = "Имя не может быть пустым")
    @Size(min = 3, max = 50, message = "Имя должно содержать от 3 до 50 символов")
    private String name;
    
    @Size(max = 20, message = "Телефон должен содержать не более 20 символов")
    private String phone;
    
    @Size(max = 50, message = "Имя пользователя в Telegram должно содержать не более 50 символов")
    private String telegramUser;
    
    @Size(max = 50, message = "ID чата Telegram должен содержать не более 50 символов")
    private String telegramChatId;
} 