package org.aquastream.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.aquastream.user.dto.request.UpdateUserRequest;
import org.aquastream.user.dto.request.UserRoleRequest;
import org.aquastream.user.dto.response.MessageResponse;
import org.aquastream.user.dto.response.UserResponse;
import org.aquastream.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.Mockito.verify;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    private UserResponse testUserResponse;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testUserResponse = UserResponse.builder()
                .id(testUserId)
                .username("testuser")
                .name("Test User")
                .phone("+79991234567")
                .telegramUser("@testuser")
                .telegramChatId("123456789")
                .role("USER")
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @WithMockUser
    @DisplayName("Получение профиля текущего пользователя")
    void getCurrentUserProfile_ShouldReturnUserProfile() throws Exception {
        when(userService.getCurrentUserProfile()).thenReturn(testUserResponse);

        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testUserId.toString()))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    @WithMockUser
    @DisplayName("Обновление профиля текущего пользователя")
    void updateCurrentUserProfile_ShouldUpdateAndReturnUserProfile() throws Exception {
        UpdateUserRequest updateRequest = UpdateUserRequest.builder()
                .name("Updated User")
                .phone("+79997654321")
                .telegramUser("@updateduser")
                .telegramChatId("987654321")
                .build();

        UserResponse updatedResponse = UserResponse.builder()
                .id(testUserId)
                .username("testuser")
                .name("Updated User")
                .phone("+79997654321")
                .telegramUser("@updateduser")
                .telegramChatId("987654321")
                .role("USER")
                .active(true)
                .createdAt(testUserResponse.getCreatedAt())
                .updatedAt(LocalDateTime.now())
                .build();

        when(userService.updateCurrentUserProfile(any(UpdateUserRequest.class))).thenReturn(updatedResponse);

        mockMvc.perform(put("/api/users/me")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated User"))
                .andExpect(jsonPath("$.phone").value("+79997654321"))
                .andExpect(jsonPath("$.telegramUser").value("@updateduser"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Получение пользователя по ID (администратор)")
    void getUserById_AsAdmin_ShouldReturnUserProfile() throws Exception {
        when(userService.getUserResponseById(testUserId)).thenReturn(testUserResponse);

        mockMvc.perform(get("/api/users/" + testUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testUserId.toString()))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Изменение роли пользователя")
    void updateUserRole_ShouldUpdateRoleAndReturnMessage() throws Exception {
        UserRoleRequest roleRequest = new UserRoleRequest();
        roleRequest.setRole("ORGANIZER");

        MessageResponse successResponse = new MessageResponse("Роль пользователя успешно обновлена");

        when(userService.updateUserRole(eq(testUserId), any(UserRoleRequest.class))).thenReturn(successResponse);

        mockMvc.perform(put("/api/users/" + testUserId + "/roles")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(roleRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Роль пользователя успешно обновлена"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Активация пользователя")
    void activateUser_ShouldActivateAndReturnMessage() throws Exception {
        MessageResponse successResponse = new MessageResponse("Пользователь успешно активирован");

        when(userService.activateUser(testUserId)).thenReturn(successResponse);

        mockMvc.perform(put("/api/users/" + testUserId + "/activate")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Пользователь успешно активирован"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Деактивация пользователя")
    void deactivateUser_ShouldDeactivateAndReturnMessage() throws Exception {
        MessageResponse successResponse = new MessageResponse("Пользователь успешно деактивирован");

        when(userService.deactivateUser(testUserId)).thenReturn(successResponse);

        mockMvc.perform(put("/api/users/" + testUserId + "/deactivate")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Пользователь успешно деактивирован"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getUserById_ShouldReturnUserResponse() throws Exception {
        UUID testUserId = UUID.randomUUID();
        UserResponse testUserResponse = new UserResponse();
        testUserResponse.setId(testUserId);
        testUserResponse.setUsername("testuser");
        testUserResponse.setName("Test User");
        testUserResponse.setRole("USER");

        when(userService.getUserResponseById(testUserId)).thenReturn(testUserResponse);

        mockMvc.perform(get("/api/users/" + testUserId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testUserId.toString()))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.role").value("USER"));

        verify(userService).getUserResponseById(testUserId);
    }
} 