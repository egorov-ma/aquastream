package org.aquastream.user.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.aquastream.user.dto.request.LoginRequest;
import org.aquastream.user.dto.request.SignupRequest;
import org.aquastream.user.dto.response.JwtResponse;
import org.aquastream.user.dto.response.MessageResponse;
import org.aquastream.common.domain.user.ERole;
import org.aquastream.user.entity.User;
import org.aquastream.user.event.UserEventProducer;
import org.aquastream.user.repository.UserRepository;
import org.aquastream.user.service.RefreshTokenService;
import org.aquastream.user.security.jwt.JwtUtils;
import org.aquastream.user.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST controller providing authentication and registration endpoints.
 * <p>
 * User roles are represented by {@link org.aquastream.common.domain.user.ERole}
 * from the common domain package. This replaces the previous dependency on
 * <code>org.aquastream.common.dto.ERole</code> and documents the enum's new
 * location for future maintenance.
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
@Tag(name = "auth", description = "API для аутентификации и авторизации пользователей")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    UserEventProducer userEventProducer;

    @Autowired
    RefreshTokenService refreshTokenService;

    @PostMapping("/login")
    @Operation(summary = "Аутентификация пользователя", description = "Аутентифицирует пользователя по имени пользователя и паролю и возвращает JWT токен")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Успешная аутентификация", content = @Content(schema = @Schema(implementation = JwtResponse.class))),
            @ApiResponse(responseCode = "401", description = "Неверные учетные данные")
    })
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User userEntity = userRepository.findById(userDetails.getId()).orElseThrow();
        String refreshToken = refreshTokenService.createRefreshToken(userEntity).getToken();

        return ResponseEntity.ok(JwtResponse.builder()
                .token(jwt)
                .refreshToken(refreshToken)
                .id(userDetails.getId())
                .username(userDetails.getUsername())
                .name(userDetails.getName())
                .role(userDetails.getRole())
                .build());
    }

    /**
     * Получить статические JWT токены для ролей из
     * {@link org.aquastream.common.domain.user.ERole}.
     */
    @GetMapping("/static-tokens")
    @Operation(summary = "Получить статические JWT токены", description = "Возвращает предварительно сгенерированные JWT токены для разных ролей (для тестирования)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Успешный запрос")
    })
    public ResponseEntity<?> getStaticTokens() {
        Map<String, String> tokens = new HashMap<>();
        tokens.put("ROLE_ADMIN", jwtUtils.getStaticTokenForRole(ERole.ROLE_ADMIN));
        tokens.put("ROLE_ORGANIZER", jwtUtils.getStaticTokenForRole(ERole.ROLE_ORGANIZER));
        tokens.put("ROLE_USER", jwtUtils.getStaticTokenForRole(ERole.ROLE_USER));
        return ResponseEntity.ok(tokens);
    }

    /**
     * Регистрация нового пользователя. Роль присваивается с использованием
     * {@link org.aquastream.common.domain.user.ERole} из пакета common domain.
     */
    @PostMapping({ "/signup", "/register" })
    @Operation(summary = "Регистрация нового пользователя", description = "Регистрирует нового пользователя в системе")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Пользователь успешно зарегистрирован", content = @Content(schema = @Schema(implementation = MessageResponse.class))),
            @ApiResponse(responseCode = "400", description = "Некорректные данные для регистрации", content = @Content(schema = @Schema(implementation = MessageResponse.class)))
    })
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (signUpRequest.getTelegramUser() != null
                && userRepository.existsByTelegramUser(signUpRequest.getTelegramUser())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Telegram username is already in use!"));
        }

        // Определение роли (используем ERole из пакета org.aquastream.common.domain.user)
        ERole role = ERole.ROLE_USER; // По умолчанию обычный пользователь
        if (signUpRequest.getRole() != null) {
            switch (signUpRequest.getRole().toLowerCase()) {
                case "admin":
                    role = ERole.ROLE_ADMIN;
                    break;
                case "organizer":
                    role = ERole.ROLE_ORGANIZER;
                    break;
            }
        }

        // Create new user's account
        User user = User.builder()
                .name(signUpRequest.getName())
                .username(signUpRequest.getUsername())
                .password(encoder.encode(signUpRequest.getPassword()))
                .telegramUser(signUpRequest.getTelegramUser())
                .phone(signUpRequest.getPhone())
                .role(role)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);

        // Kafka event
        userEventProducer.sendUserRegistrationEvent(savedUser);

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(signUpRequest.getUsername(), signUpRequest.getPassword()));
        String jwt = jwtUtils.generateJwtToken(auth);
        String refreshToken = refreshTokenService.createRefreshToken(savedUser).getToken();

        return ResponseEntity.ok(JwtResponse.builder()
                .token(jwt)
                .refreshToken(refreshToken)
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .name(savedUser.getName())
                .role(savedUser.getRole().name())
                .build());
    }

    // Refresh endpoint
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        String requestToken = request.get("refreshToken");
        return refreshTokenService.findByToken(requestToken)
                .map(refreshTokenService::verifyExpiration)
                .<ResponseEntity<?>>map(rt -> {
                    String token = jwtUtils.generateJwtToken(
                            new UsernamePasswordAuthenticationToken(rt.getUser().getUsername(), null,
                                    Collections.emptyList()));
                    String newRefresh = refreshTokenService.createRefreshToken(rt.getUser()).getToken();
                    return ResponseEntity.ok(JwtResponse.builder()
                            .token(token)
                            .refreshToken(newRefresh)
                            .id(rt.getUser().getId())
                            .username(rt.getUser().getUsername())
                            .name(rt.getUser().getName())
                            .role(rt.getUser().getRole().name())
                            .build());
                })
                .orElseGet(() -> ResponseEntity.badRequest().body(new MessageResponse("Invalid refresh token")));
    }
}