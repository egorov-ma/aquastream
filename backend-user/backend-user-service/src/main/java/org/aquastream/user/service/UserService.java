package org.aquastream.user.service;

import lombok.RequiredArgsConstructor;
import org.aquastream.user.dto.UserDto;
import org.aquastream.user.dto.UserProfileDto;
import org.aquastream.user.dto.request.UpdateUserRequest;
import org.aquastream.user.dto.request.UserRoleRequest;
import org.aquastream.user.dto.response.MessageResponse;
import org.aquastream.user.dto.response.UserResponse;
import org.aquastream.common.domain.user.ERole;
import org.aquastream.user.entity.User;
import org.aquastream.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Service layer for user management.
 * <p>
 * Role-related operations rely on
 * {@link org.aquastream.common.domain.user.ERole} from the common domain
 * package, replacing the deprecated {@code org.aquastream.common.dto.ERole}.
 */
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Retrieves all users optionally filtered by role. The provided role name is
     * mapped to {@link org.aquastream.common.domain.user.ERole} from the common
     * domain package.
     */
    @Transactional(readOnly = true)
    public Page<UserProfileDto> getAllUsers(String role, Pageable pageable) {
        Page<User> users;
        if (role != null && !role.isEmpty()) {
            ERole eRole;
            switch (role.toLowerCase()) {
                case "admin":
                    eRole = ERole.ROLE_ADMIN;
                    break;
                case "organizer":
                    eRole = ERole.ROLE_ORGANIZER;
                    break;
                default:
                    eRole = ERole.ROLE_USER;
            }
            users = userRepository.findByRole(eRole, pageable);
        } else {
            users = userRepository.findAll(pageable);
        }
        return users.map(this::convertToUserProfileDto);
    }

    @Transactional(readOnly = true)
    public User getUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Updates user information and, if requested by an administrator, changes the
     * user's role using {@link org.aquastream.common.domain.user.ERole}.
     */
    @Transactional
    public User updateUser(UUID id, UserDto userDto, String currentUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Пользователь может изменить только свой профиль или администратор может изменить любой профиль
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        boolean isAdmin = currentUser.getRole() == ERole.ROLE_ADMIN;

        if (!currentUser.getId().equals(id) && !isAdmin) {
            throw new AccessDeniedException("You can't modify other user's profile");
        }

        // Обновляем только разрешенные поля
        if (userDto.getName() != null) {
            user.setName(userDto.getName());
        }

        if (userDto.getPhone() != null) {
            user.setPhone(userDto.getPhone());
        }

        if (userDto.getTelegramUser() != null) {
            user.setTelegramUser(userDto.getTelegramUser());
        }

        // Пароль обрабатываем отдельно, так как его нужно хешировать
        if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        }

        // Только администратор может изменять роль
        if (userDto.getRole() != null && !userDto.getRole().isEmpty() && isAdmin) {
            ERole role;
            switch (userDto.getRole().toLowerCase()) {
                case "admin":
                    role = ERole.ROLE_ADMIN;
                    break;
                case "organizer":
                    role = ERole.ROLE_ORGANIZER;
                    break;
                default:
                    role = ERole.ROLE_USER;
            }
            user.setRole(role);
        }

        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setActive(false);
        userRepository.save(user);
    }

    @Transactional
    public void hardDeleteUser(UUID id) {
        userRepository.deleteById(id);
    }
    
    @Transactional(readOnly = true)
    public UserProfileDto getUserProfile(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        return convertToUserProfileDto(user);
    }
    
    @Transactional
    public UserProfileDto updateUserProfile(UUID id, UserProfileDto profileDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        // Обновляем только разрешенные поля
        if (profileDto.getName() != null) {
            user.setName(profileDto.getName());
        }

        if (profileDto.getPhone() != null) {
            user.setPhone(profileDto.getPhone());
        }

        if (profileDto.getTelegramUser() != null) {
            user.setTelegramUser(profileDto.getTelegramUser());
        }

        if (profileDto.getTelegramChatId() != null) {
            user.setTelegramChatId(profileDto.getTelegramChatId());
        }

        User savedUser = userRepository.save(user);
        return convertToUserProfileDto(savedUser);
    }
    
    /**
     * Updates a user's role using {@link org.aquastream.common.domain.user.ERole}.
     */
    @Transactional
    public void updateUserRole(UUID id, String roleName) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        ERole role;
        switch (roleName.toLowerCase()) {
            case "admin":
                role = ERole.ROLE_ADMIN;
                break;
            case "organizer":
                role = ERole.ROLE_ORGANIZER;
                break;
            default:
                role = ERole.ROLE_USER;
        }
        
        user.setRole(role);
        userRepository.save(user);
    }
    
    @Transactional
    public void setUserActiveStatus(UUID id, boolean isActive) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        user.setActive(isActive);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public UserDto convertToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setName(user.getName());
        dto.setPhone(user.getPhone());
        dto.setTelegramUser(user.getTelegramUser());
        dto.setActive(user.isActive());
        dto.setRole(user.getRole().name());
        return dto;
    }
    
    private UserProfileDto convertToUserProfileDto(User user) {
        return UserProfileDto.builder()
                .id(user.getId())
                .name(user.getName())
                .username(user.getUsername())
                .telegramUser(user.getTelegramUser())
                .telegramChatId(user.getTelegramChatId())
                .phone(user.getPhone())
                .active(user.isActive())
                .role(user.getRole().name())
                .build();
    }

    /**
     * Получение профиля текущего авторизованного пользователя
     * @return данные профиля пользователя
     */
    @Transactional(readOnly = true)
    public UserResponse getCurrentUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Пользователь не найден: " + username));
        return convertToUserResponse(user);
    }
    
    /**
     * Обновление профиля текущего авторизованного пользователя
     * @param updateUserRequest данные для обновления профиля
     * @return обновленные данные профиля
     */
    @Transactional
    public UserResponse updateCurrentUserProfile(UpdateUserRequest updateUserRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Пользователь не найден: " + username));
        
        user.setName(updateUserRequest.getName());
        user.setPhone(updateUserRequest.getPhone());
        user.setTelegramUser(updateUserRequest.getTelegramUser());
        user.setTelegramChatId(updateUserRequest.getTelegramChatId());
        user.setUpdatedAt(LocalDateTime.now());
        
        User updatedUser = userRepository.save(user);
        return convertToUserResponse(updatedUser);
    }
    
    /**
     * Получение данных пользователя по ID
     * @param id идентификатор пользователя
     * @return данные профиля пользователя
     */
    @Transactional(readOnly = true)
    public UserResponse getUserResponseById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("Пользователь не найден с ID: " + id));
        return convertToUserResponse(user);
    }
    
    /**
     * Обновление роли пользователя с использованием
     * {@link org.aquastream.common.domain.user.ERole}.
     *
     * @param id идентификатор пользователя
     * @param userRoleRequest запрос с новой ролью
     * @return сообщение о результате операции
     */
    @Transactional
    public MessageResponse updateUserRole(UUID id, UserRoleRequest userRoleRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("Пользователь не найден с ID: " + id));
        
        try {
            ERole newRole = ERole.valueOf("ROLE_" + userRoleRequest.getRole().toUpperCase());
            user.setRole(newRole);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
            return new MessageResponse("Роль пользователя успешно обновлена");
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Недопустимая роль: " + userRoleRequest.getRole());
        }
    }
    
    /**
     * Активация учетной записи пользователя
     * @param id идентификатор пользователя
     * @return сообщение о результате операции
     */
    @Transactional
    public MessageResponse activateUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("Пользователь не найден с ID: " + id));
        
        user.setActive(true);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        return new MessageResponse("Пользователь успешно активирован");
    }
    
    /**
     * Деактивация учетной записи пользователя
     * @param id идентификатор пользователя
     * @return сообщение о результате операции
     */
    @Transactional
    public MessageResponse deactivateUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("Пользователь не найден с ID: " + id));
        
        user.setActive(false);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        return new MessageResponse("Пользователь успешно деактивирован");
    }
    
    /**
     * Преобразование сущности пользователя в DTO ответа
     * @param user сущность пользователя
     * @return DTO с данными пользователя
     */
    private UserResponse convertToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .phone(user.getPhone())
                .telegramUser(user.getTelegramUser())
                .telegramChatId(user.getTelegramChatId())
                .role(user.getRole().name().replace("ROLE_", ""))
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
} 