package org.aquastream.user.api.controller;

import lombok.RequiredArgsConstructor;
import org.aquastream.user.service.AuthService;
import org.aquastream.user.service.RecoveryService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import org.aquastream.user.api.dto.response.RecoveryOptionsResponse;
import org.aquastream.user.api.dto.response.SimpleSuccessResponse;

@RestController
@RequestMapping("/api/v1")
@Validated
@RequiredArgsConstructor
public class RecoveryController {
    private final RecoveryService recoveryService;
    private final AuthService authService;

    @GetMapping("/recovery/options")
    public ResponseEntity<RecoveryOptionsResponse> options(@RequestParam String username) {
        var opts = recoveryService.options(username);
        RecoveryOptionsResponse resp = RecoveryOptionsResponse.builder()
                .telegram(Boolean.TRUE.equals((Boolean) opts.getOrDefault("telegram", false)))
                .backupCode(Boolean.TRUE.equals((Boolean) opts.getOrDefault("backupCode", false)))
                .build();
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/auth/recovery/init")
    public ResponseEntity<SimpleSuccessResponse> init(@RequestParam String username) {
        recoveryService.initByUsername(username);
        return ResponseEntity.ok(SimpleSuccessResponse.builder().success(true).message("init sent").build());
    }

    @PostMapping("/auth/recovery/verify")
    public ResponseEntity<SimpleSuccessResponse> verify(@RequestParam String username, @RequestParam String code) {
        boolean ok = recoveryService.verifyByUsername(username, code);
        var body = SimpleSuccessResponse.builder().success(ok).message(ok ? "verified" : "invalid code").build();
        return ok ? ResponseEntity.ok(body) : ResponseEntity.status(400).body(body);
    }

    @PostMapping("/auth/recovery/reset")
    public ResponseEntity<SimpleSuccessResponse> reset(@RequestParam String username, @RequestParam String code, @RequestParam String newPassword) {
        boolean ok = recoveryService.resetByUsername(username, code, newPassword);
        var body = SimpleSuccessResponse.builder().success(ok).message(ok ? "password reset" : "invalid code or user").build();
        return ok ? ResponseEntity.ok(body) : ResponseEntity.status(400).body(body);
    }
}
