package org.aquastream.user.api.controller;

import lombok.RequiredArgsConstructor;
import org.aquastream.user.db.entity.UserEntity;
import org.aquastream.user.db.repo.UserRepository;
import org.aquastream.user.service.AuthService;
import org.aquastream.user.service.RecoveryService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@Validated
@RequiredArgsConstructor
public class RecoveryController {
    private final RecoveryService recoveryService;
    private final UserRepository users;
    private final AuthService authService;

    @GetMapping("/recovery/options")
    public ResponseEntity<?> options(@RequestParam String username) {
        return ResponseEntity.ok(recoveryService.options(username));
    }

    @PostMapping("/auth/recovery/init")
    public ResponseEntity<?> init(@RequestParam String username) {
        UserEntity user = users.findByUsernameIgnoreCase(username).orElse(null);
        if (user != null) {
            recoveryService.initTelegram(user.getId());
        }
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/auth/recovery/verify")
    public ResponseEntity<?> verify(@RequestParam String username, @RequestParam String code) {
        UserEntity user = users.findByUsernameIgnoreCase(username).orElse(null);
        boolean ok = user != null && recoveryService.verifyCode(user.getId(), code);
        return ok ? ResponseEntity.ok(Map.of("success", true)) : ResponseEntity.status(400).body(Map.of("success", false));
    }

    @PostMapping("/auth/recovery/reset")
    public ResponseEntity<?> reset(@RequestParam String username, @RequestParam String code, @RequestParam String newPassword) {
        UserEntity user = users.findByUsernameIgnoreCase(username).orElse(null);
        if (user == null || !recoveryService.verifyCode(user.getId(), code)) {
            return ResponseEntity.status(400).body(Map.of("success", false));
        }
        recoveryService.resetPassword(user.getId(), newPassword);
        return ResponseEntity.ok(Map.of("success", true));
    }
}


