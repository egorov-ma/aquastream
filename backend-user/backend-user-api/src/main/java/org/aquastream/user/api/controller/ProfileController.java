package org.aquastream.user.api.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aquastream.user.db.entity.ProfileEntity;
import org.aquastream.user.db.entity.UserEntity;
import org.aquastream.user.db.repo.ProfileRepository;
import org.aquastream.user.db.repo.UserRepository;
import org.aquastream.user.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final AuthService authService;
    private final UserRepository users;
    private final ProfileRepository profiles;

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest request) {
        String token = Arrays.stream(request.getCookies() == null ? new Cookie[]{} : request.getCookies())
                .filter(c -> "token".equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        UUID userId = authService.parseTokenSubject(token);
        UserEntity user = users.findById(userId).orElseThrow();
        ProfileEntity profile = profiles.findById(userId).orElse(null);
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "role", user.getRole(),
                "active", user.isActive(),
                "profile", profile
        ));
    }
}


