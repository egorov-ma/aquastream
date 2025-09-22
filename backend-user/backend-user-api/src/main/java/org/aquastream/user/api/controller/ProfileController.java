package org.aquastream.user.api.controller;

import lombok.RequiredArgsConstructor;
import org.aquastream.user.service.AuthService;
import org.aquastream.user.service.ProfileService;
import org.aquastream.user.service.dto.UserWithProfile;
import org.aquastream.user.api.dto.response.ProfileResponse;
import org.aquastream.user.api.dto.request.UpdateProfileRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import jakarta.validation.Valid;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final AuthService authService;
    private final ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> me(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        UUID userId = UUID.fromString(authentication.getName());
        UserWithProfile uwp = profileService.getUserWithProfile(userId);
        ProfileResponse resp = ProfileResponse.builder()
                .id(uwp.getUser().getId())
                .username(uwp.getUser().getUsername())
                .role(uwp.getUser().getRole())
                .active(uwp.getUser().isActive())
                .profile(ProfileResponse.ProfileInfo.builder()
                        .phone(uwp.getProfile().getPhone())
                        .telegram(uwp.getProfile().getTelegram())
                        .isTelegramVerified(uwp.getProfile().isTelegramVerified())
                        .build())
                .build();
        return ResponseEntity.ok(resp);
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> update(Authentication authentication, @RequestBody @Valid UpdateProfileRequest request) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        UUID userId = UUID.fromString(authentication.getName());
        var profile = profileService.updateProfile(
                userId,
                request.phone(),
                request.telegram()
        );
        ProfileResponse resp = ProfileResponse.builder()
                .id(userId)
                .username(null)
                .role(null)
                .active(true)
                .profile(ProfileResponse.ProfileInfo.builder()
                        .phone(profile.getPhone())
                        .telegram(profile.getTelegram())
                        .isTelegramVerified(profile.isTelegramVerified())
                        .build())
                .build();
        return ResponseEntity.ok(resp);
    }
}
