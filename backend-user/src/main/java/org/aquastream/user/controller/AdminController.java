package org.aquastream.user.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.aquastream.user.dto.UserProfileDto;
import org.aquastream.user.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Контроллер для административных операций с пользователями
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "admin", description = "Административные операции")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class AdminController {
    private final UserService userService;
    
    @GetMapping("/users")
    @Operation(summary = "Получить список всех пользователей", 
               description = "Возвращает страницу пользователей с возможностью фильтрации по роли")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Успешный запрос"),
        @ApiResponse(responseCode = "403", description = "Доступ запрещен")
    })
    public ResponseEntity<Page<UserProfileDto>> getAllUsers(
            @Parameter(description = "Фильтр по роли пользователя (опционально)") 
            @RequestParam(required = false) String role,
            Pageable pageable) {
        Page<UserProfileDto> users = userService.getAllUsers(role, pageable);
        return ResponseEntity.ok(users);
    }
} 