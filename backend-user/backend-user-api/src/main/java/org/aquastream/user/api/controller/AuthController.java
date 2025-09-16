package org.aquastream.user.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
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
import org.aquastream.user.api.dto.response.RevokeAllResponse;

@RestController
@RequestMapping("/api/v1/auth")
@Validated
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User authentication and session management")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Register new user", description = "Create new user account and return authentication tokens")
    @ApiResponse(responseCode = "200", description = "User registered successfully")
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid RegisterRequest req,
                                      HttpServletResponse response) {
        UserEntity user = authService.register(req.getUsername(), req.getPassword());
        var tokens = authService.login(req.getUsername(), req.getPassword());
        response.addCookie(buildJwtCookie("access", tokens.access(), authService.getAccessTtlSeconds()));
        response.addCookie(buildJwtCookie("refresh", tokens.refreshJti(), authService.getRefreshTtlSeconds()));
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "User login", description = "Authenticate user and return JWT tokens")
    @ApiResponse(responseCode = "200", description = "Login successful")
    @ApiResponse(responseCode = "401", description = "Invalid credentials")
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequest req,
                                   HttpServletResponse response) {
        var tokens = authService.login(req.getUsername(), req.getPassword());
        response.addCookie(buildJwtCookie("access", tokens.access(), authService.getAccessTtlSeconds()));
        response.addCookie(buildJwtCookie("refresh", tokens.refreshJti(), authService.getRefreshTtlSeconds()));
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "User logout", description = "Invalidate current session and clear cookies")
    @ApiResponse(responseCode = "200", description = "Logout successful")
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

    @Operation(summary = "Refresh tokens", description = "Refresh access token using refresh token")
    @ApiResponse(responseCode = "200", description = "Tokens refreshed successfully")
    @ApiResponse(responseCode = "401", description = "Invalid refresh token")
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
    
    @Operation(summary = "Revoke all sessions", description = "Revoke all active sessions for current user")
    @ApiResponse(responseCode = "200", description = "All sessions revoked")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    @PostMapping("/revoke-all")
    public ResponseEntity<?> revokeAllSessions(HttpServletRequest request, HttpServletResponse response) {
        // Get user from current refresh token
        String refreshJti = getCookie(request, "refresh");
        if (refreshJti == null || refreshJti.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            var userId = authService.validateRefreshAndGetUser(refreshJti);
            int revokedCount = authService.revokeAllUserSessions(userId);
            
            // Clear cookies
            response.addCookie(buildJwtCookie("access", "", 0));
            response.addCookie(buildJwtCookie("refresh", "", 0));
            
            return ResponseEntity.ok(new RevokeAllResponse(revokedCount, "All sessions revoked successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
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


