package org.aquastream.user.service;

import lombok.RequiredArgsConstructor;
import org.aquastream.user.db.entity.ProfileEntity;
import org.aquastream.user.db.entity.UserEntity;
import org.aquastream.user.db.repository.ProfileRepository;
import org.aquastream.user.db.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class TelegramLinkService {
    private final ProfileRepository profiles;
    private final UserRepository users;

    @Value("${app.telegram.bot:aqstream_bot}")
    private String botName;

    @Value("${app.telegram.linkTtlSeconds:600}")
    private long linkTtlSeconds;

    private final Map<String, LinkEntry> codeToUser = new ConcurrentHashMap<>();

    public LinkResult initLink(UUID userId) {
        String code = UUID.randomUUID().toString().replace("-", "");
        codeToUser.put(code, new LinkEntry(userId, Instant.now().plusSeconds(linkTtlSeconds)));
        String link = "https://t.me/" + botName + "?start=" + code;
        return new LinkResult(code, link);
    }

    public boolean confirm(String code) {
        LinkEntry entry = codeToUser.remove(code);
        if (entry == null || entry.expiresAt().isBefore(Instant.now())) return false;
        UUID userId = entry.userId();
        // ensure profile exists
        ProfileEntity profile = profiles.findById(userId).orElseGet(() -> {
            ProfileEntity p = ProfileEntity.builder().userId(userId).telegram(null).telegramVerified(false).build();
            return profiles.save(p);
        });
        profile.setTelegramVerified(true);
        profiles.save(profile);
        return true;
    }

    private record LinkEntry(UUID userId, Instant expiresAt) {}

    public record LinkResult(String code, String deeplink) {}
}

