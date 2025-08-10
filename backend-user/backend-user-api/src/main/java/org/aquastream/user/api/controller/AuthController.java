package org.aquastream.user.api.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.aquastream.user.db.entity.UserEntity;
import org.aquastream.user.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Validated
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestParam @NotBlank String username,
                                      @RequestParam @NotBlank String password,
                                      HttpServletResponse response) {
        UserEntity user = authService.register(username, password);
        var tokens = authService.login(username, password);
        response.addCookie(buildJwtCookie("access", tokens.access(), 15 * 60));
        response.addCookie(buildJwtCookie("refresh", tokens.refreshJti(), 30 * 24 * 60 * 60));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam @NotBlank String username,
                                   @RequestParam @NotBlank String password,
                                   HttpServletResponse response) {
        var tokens = authService.login(username, password);
        response.addCookie(buildJwtCookie("access", tokens.access(), 15 * 60));
        response.addCookie(buildJwtCookie("refresh", tokens.refreshJti(), 30 * 24 * 60 * 60));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        // revoke refresh by cookie
        String refreshJti = getCookie(request, "refresh");
        if (refreshJti != null) {
            authService.revokeRefresh(refreshJti);
        }
        // clear cookies
        response.addCookie(buildJwtCookie("access", "", 0));
        response.addCookie(buildJwtCookie("refresh", "", 0));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshJti = getCookie(request, "refresh");
        if (refreshJti == null || refreshJti.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        // validate refresh and rotate
        var userId = authService.validateRefreshAndGetUser(refreshJti);
        var tokens = authService.refresh(userId, refreshJti);
        response.addCookie(buildJwtCookie("access", tokens.access(), 15 * 60));
        response.addCookie(buildJwtCookie("refresh", tokens.refreshJti(), 30 * 24 * 60 * 60));
        return ResponseEntity.ok().build();
    }

    private Cookie buildJwtCookie(String name, String value, int maxAge) {
        Cookie c = new Cookie(name, value);
        c.setHttpOnly(true);
        c.setSecure(true);
        c.setPath("/");
        c.setMaxAge(maxAge);
        return c;
    }

    private String getCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if (name.equals(cookie.getName())) return cookie.getValue();
        }
        return null;
    }
}


