package org.aquastream.user.api.controller;

import jakarta.servlet.http.Cookie;
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
        String token = authService.issueAccessToken(user, 15 * 60);
        Cookie c = buildJwtCookie(token);
        response.addCookie(c);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam @NotBlank String username,
                                   @RequestParam @NotBlank String password,
                                   HttpServletResponse response) {
        UserEntity user = authService.authenticate(username, password);
        String token = authService.issueAccessToken(user, 15 * 60);
        Cookie c = buildJwtCookie(token);
        response.addCookie(c);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie c = buildJwtCookie("");
        c.setMaxAge(0);
        response.addCookie(c);
        return ResponseEntity.ok().build();
    }

    private Cookie buildJwtCookie(String value) {
        Cookie c = new Cookie("token", value);
        c.setHttpOnly(true);
        c.setSecure(true);
        c.setPath("/");
        c.setMaxAge(15 * 60);
        return c;
    }
}


