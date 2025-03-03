package org.aquastream.user.dto.response;

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
@Schema(description = "Ответ, содержащий JWT токен и информацию о пользователе")
public class JwtResponse {
    @Schema(description = "JWT токен аутентификации", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String token;
    
    @Schema(description = "Тип токена", example = "Bearer", defaultValue = "Bearer")
    @Builder.Default
    private String type = "Bearer";
    
    @Schema(description = "Уникальный идентификатор пользователя", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;
    
    @Schema(description = "Имя пользователя (логин)", example = "johndoe")
    private String username;
    
    @Schema(description = "Полное имя пользователя", example = "Иван Иванов")
    private String name;
    
    @Schema(description = "Роль пользователя в системе", example = "ROLE_USER", allowableValues = {"ROLE_USER", "ROLE_ADMIN", "ROLE_ORGANIZER"})
    private String role;
} 