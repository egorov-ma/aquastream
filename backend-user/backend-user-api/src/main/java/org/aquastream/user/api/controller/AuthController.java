package org.aquastream.user.api.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.aquastream.user.db.entity.UserEntity;
import org.aquastream.user.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.aquastream.user.api.dto.request.LoginRequest;
import org.aquastream.user.api.dto.request.RegisterRequest;

@RestController
@RequestMapping("/api/v1/auth")
@Validated
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid RegisterRequest req,
                                      HttpServletResponse response) {
        UserEntity user = authService.register(req.getUsername(), req.getPassword());
        var tokens = authService.login(req.getUsername(), req.getPassword());
        response.addCookie(buildJwtCookie("access", tokens.access(), authService.getAccessTtlSeconds()));
        response.addCookie(buildJwtCookie("refresh", tokens.refreshJti(), authService.getRefreshTtlSeconds()));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequest req,
                                   HttpServletResponse response) {
        var tokens = authService.login(req.getUsername(), req.getPassword());
        response.addCookie(buildJwtCookie("access", tokens.access(), authService.getAccessTtlSeconds()));
        response.addCookie(buildJwtCookie("refresh", tokens.refreshJti(), authService.getRefreshTtlSeconds()));
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
        response.addCookie(buildJwtCookie("access", tokens.access(), authService.getAccessTtlSeconds()));
        response.addCookie(buildJwtCookie("refresh", tokens.refreshJti(), authService.getRefreshTtlSeconds()));
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


