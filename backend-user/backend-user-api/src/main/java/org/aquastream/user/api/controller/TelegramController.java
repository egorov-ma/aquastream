package org.aquastream.user.api.controller;

import lombok.RequiredArgsConstructor;
import org.aquastream.user.service.AuthService;
import org.aquastream.user.service.TelegramLinkService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;
import org.aquastream.user.api.dto.response.TelegramLinkInitResponse;
import org.aquastream.user.api.dto.response.SimpleSuccessResponse;

@RestController
@RequestMapping("/api/v1/telegram")
@Validated
@RequiredArgsConstructor
public class TelegramController {

    private final TelegramLinkService telegramLinkService;
    private final AuthService authService;

    @PostMapping("/link/init")
    public ResponseEntity<TelegramLinkInitResponse> initLink(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        UUID userId = UUID.fromString(authentication.getName());
        var res = telegramLinkService.initLink(userId);
        return ResponseEntity.ok(TelegramLinkInitResponse.builder()
                .code(res.code())
                .deeplink(res.deeplink())
                .build());
    }

    @PostMapping("/link/confirm")
    public ResponseEntity<SimpleSuccessResponse> confirm(@RequestParam("code") String code) {
        boolean ok = telegramLinkService.confirm(code);
        var body = SimpleSuccessResponse.builder().success(ok).message(ok ? "linked" : "invalid code").build();
        if (!ok) return ResponseEntity.status(400).body(body);
        return ResponseEntity.ok(body);
    }
}

