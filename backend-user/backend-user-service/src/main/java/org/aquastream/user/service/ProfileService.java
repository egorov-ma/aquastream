package org.aquastream.user.service;

import lombok.RequiredArgsConstructor;
import org.aquastream.user.db.entity.ProfileEntity;
import org.aquastream.user.db.entity.UserEntity;
import org.aquastream.user.db.repository.ProfileRepository;
import org.aquastream.user.db.repository.UserRepository;
import org.aquastream.user.service.dto.ProfileSummary;
import org.aquastream.user.service.dto.UserSummary;
import org.aquastream.user.service.dto.UserWithProfile;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final UserRepository users;
    private final ProfileRepository profiles;

    public UserWithProfile getUserWithProfile(UUID userId) {
        UserEntity user = users.findById(userId).orElseThrow();
        ProfileEntity profile = profiles.findById(userId).orElse(null);
        return UserWithProfile.builder()
                .user(UserSummary.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .role(user.getRole())
                        .active(user.isActive())
                        .createdAt(user.getCreatedAt())
                        .build())
                .profile(ProfileSummary.builder()
                        .phone(profile != null ? profile.getPhone() : null)
                        .telegram(profile != null ? profile.getTelegram() : null)
                        .telegramVerified(profile != null && profile.isTelegramVerified())
                        .build())
                .build();
    }

    public ProfileSummary updateProfile(UUID userId, String phone, String telegram) {
        ProfileEntity profile = profiles.findById(userId)
                .orElseGet(() -> ProfileEntity.builder().userId(userId).build());
        if (phone != null) profile.setPhone(phone);
        if (telegram != null) profile.setTelegram(telegram);
        profiles.save(profile);
        return ProfileSummary.builder()
                .phone(profile.getPhone())
                .telegram(profile.getTelegram())
                .telegramVerified(profile.isTelegramVerified())
                .build();
    }
}

