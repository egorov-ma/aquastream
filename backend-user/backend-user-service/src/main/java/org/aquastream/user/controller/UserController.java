package org.aquastream.user.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.aquastream.user.dto.UserProfileDto;
import org.aquastream.user.dto.request.UpdateUserRequest;
import org.aquastream.user.dto.request.UserRoleRequest;
import org.aquastream.user.dto.response.MessageResponse;
import org.aquastream.user.dto.response.UserResponse;
import org.aquastream.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Контроллер для управления пользователями
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Управление пользователями", description = "API для управления пользовательскими аккаунтами")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    /**
     * Получение профиля текущего пользователя
     *
     * @return данные текущего авторизованного пользователя
     */
    @GetMapping("/me")
    @Operation(
            summary = "Получение профиля текущего пользователя",
            description = "Возвращает профиль текущего авторизованного пользователя"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Профиль успешно получен",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = UserResponse.class))),
            @ApiResponse(responseCode = "401", description = "Не авторизован",
                    content = @Content)
    })
    public ResponseEntity<UserResponse> getCurrentUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserResponse userResponse = userService.getCurrentUserProfile();
        return ResponseEntity.ok(userResponse);
    }

    /**
     * Обновление профиля текущего пользователя
     *
     * @param request данные для обновления
     * @return обновленный профиль пользователя
     */
    @PutMapping("/me")
    @Operation(
            summary = "Обновление профиля текущего пользователя",
            description = "Обновляет информацию в профиле текущего авторизованного пользователя"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Профиль успешно обновлен",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = UserResponse.class))),
            @ApiResponse(responseCode = "400", description = "Некорректные данные",
                    content = @Content),
            @ApiResponse(responseCode = "401", description = "Не авторизован",
                    content = @Content)
    })
    public ResponseEntity<UserResponse> updateCurrentUserProfile(
            @Valid @RequestBody UpdateUserRequest updateUserRequest) {
        UserResponse updatedUser = userService.updateCurrentUserProfile(updateUserRequest);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Получение профиля пользователя по ID (только для администраторов)
     *
     * @param id идентификатор пользователя
     * @return данные пользователя
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(
            summary = "Получение профиля пользователя по ID",
            description = "Возвращает данные профиля пользователя по указанному ID"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Профиль пользователя найден",
                    content = @Content(schema = @Schema(implementation = UserResponse.class))),
            @ApiResponse(responseCode = "404", description = "Пользователь не найден",
                    content = @Content(schema = @Schema(implementation = MessageResponse.class)))
    })
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id) {
        UserResponse user = userService.getUserResponseById(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Изменение роли пользователя (только для администраторов)
     *
     * @param id      идентификатор пользователя
     * @param request новая роль
     * @return обновленный профиль пользователя
     */
    @PutMapping("/{id}/roles")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(
            summary = "Изменение роли пользователя",
            description = "Изменяет роль пользователя (только для администраторов)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Роль пользователя успешно обновлена",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = MessageResponse.class))),
            @ApiResponse(responseCode = "400", description = "Некорректные данные",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "Доступ запрещен",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Пользователь не найден",
                    content = @Content)
    })
    public ResponseEntity<MessageResponse> updateUserRole(
            @Parameter(description = "ID пользователя")
            @PathVariable UUID id,
            @Valid @RequestBody UserRoleRequest userRoleRequest) {
        MessageResponse response = userService.updateUserRole(id, userRoleRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Активация учетной записи пользователя (только для администраторов)
     *
     * @param id идентификатор пользователя
     * @return статус операции
     */
    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(
            summary = "Активация учетной записи пользователя",
            description = "Активирует учетную запись пользователя (только для администраторов)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Пользователь успешно активирован",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = MessageResponse.class))),
            @ApiResponse(responseCode = "403", description = "Доступ запрещен",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Пользователь не найден",
                    content = @Content)
    })
    public ResponseEntity<MessageResponse> activateUser(
            @Parameter(description = "ID пользователя")
            @PathVariable UUID id) {
        MessageResponse response = userService.activateUser(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Деактивация учетной записи пользователя (только для администраторов)
     *
     * @param id идентификатор пользователя
     * @return статус операции
     */
    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(
            summary = "Деактивация учетной записи пользователя",
            description = "Деактивирует учетную запись пользователя (только для администраторов)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Пользователь успешно деактивирован",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = MessageResponse.class))),
            @ApiResponse(responseCode = "403", description = "Доступ запрещен",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Пользователь не найден",
                    content = @Content)
    })
    public ResponseEntity<MessageResponse> deactivateUser(
            @Parameter(description = "ID пользователя")
            @PathVariable UUID id) {
        MessageResponse response = userService.deactivateUser(id);
        return ResponseEntity.ok(response);
    }
} 