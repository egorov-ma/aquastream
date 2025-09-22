package org.aquastream.user.service;

import lombok.RequiredArgsConstructor;
import org.aquastream.user.db.entity.RecoveryCodeEntity;
import org.aquastream.user.db.entity.AuditLogEntity;
import org.aquastream.user.db.entity.UserEntity;
import org.aquastream.user.db.repository.RecoveryCodeRepository;
import org.aquastream.user.db.repository.RefreshSessionRepository;
import org.aquastream.user.db.repository.UserRepository;
import org.aquastream.user.db.repository.ProfileRepository;
import org.aquastream.user.db.entity.ProfileEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;
import org.aquastream.user.db.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecoveryService {
    private final RecoveryCodeRepository recoveryCodes;
    private final UserRepository users;
    private final ProfileRepository profiles;
    private final PasswordEncoder encoder;
    private final AuthService authService;
    private final RefreshSessionRepository refreshSessions;
    private final AuditLogRepository auditLogs;
    @Value("${app.recovery.codeTtlSeconds:900}")
    private long codeTtlSeconds;
    private final NotificationClient notificationClient;

    public Map<String, Object> options(String username) {
        var userOpt = users.findByUsernameIgnoreCase(username);
        boolean hasBackup = userOpt.isPresent();
        boolean hasTelegram = userOpt.map(u -> {
            var p = profiles.findById(u.getId()).orElse(null);
            return p != null && p.isTelegramVerified();
        }).orElse(false);
        return Map.of("telegram", hasTelegram, "backupCode", hasBackup);
    }

    public void initByUsername(String username) {
        var user = users.findByUsernameIgnoreCase(username).orElse(null);
        if (user != null) {
            initTelegram(user.getId());
        }
    }

    public boolean verifyByUsername(String username, String code) {
        var user = users.findByUsernameIgnoreCase(username).orElse(null);
        return user != null && verifyCode(user.getId(), code);
    }

    public boolean resetByUsername(String username, String code, String newPassword) {
        var user = users.findByUsernameIgnoreCase(username).orElse(null);
        if (user == null || !verifyCode(user.getId(), code)) {
            return false;
        }
        resetPassword(user.getId(), newPassword);
        return true;
    }

    public void initTelegram(UUID userId) {
        String plain = generatePlainCode();
        String hash = sha256(plain);
        RecoveryCodeEntity rc = RecoveryCodeEntity.builder()
                .userId(userId)
                .codeHash(hash)
                .expiresAt(Instant.now().plusSeconds(codeTtlSeconds))
                .build();
        recoveryCodes.save(rc);
        // Отправляем через notification сервис (по username; chatId появится при подписке)
        try {
            var user = users.findById(userId).orElse(null);
            if (user != null) {
                String text = "Код для восстановления: " + plain + " (действителен " + (codeTtlSeconds/60) + " минут)";
                notificationClient.sendTelegram(user.getUsername(), text);
            }
        } catch (Exception ignored) {}
    }

    public boolean verifyCode(UUID userId, String plainCode) {
        String hash = sha256(plainCode);
        return recoveryCodes.findById(new org.aquastream.user.db.entity.RecoveryCodeId(userId, hash))
                .filter(rc -> rc.getUsedAt() == null && rc.getExpiresAt().isAfter(Instant.now()))
                .map(rc -> {
                    rc.setUsedAt(Instant.now());
                    recoveryCodes.save(rc);
                    return true;
                }).orElse(false);
    }

    public void resetPassword(UUID userId, String newPassword) {
        UserEntity user = users.findById(userId).orElseThrow();
        user.setPasswordHash(encoder.encode(newPassword));
        users.save(user);
        // отменяем все refresh-сессии
        refreshSessions.deleteByUserId(userId);
        auditLogs.save(AuditLogEntity.builder()
                .id(UUID.randomUUID())
                .actorUserId(userId)
                .action("password.reset")
                .targetType("user")
                .targetId(userId)
                .payload(null)
                .createdAt(Instant.now())
                .build());
    }

    private String sha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(input.getBytes()));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    private String generatePlainCode() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    // HTTP logic delegated to NotificationClient
}
