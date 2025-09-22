package org.aquastream.user.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.aquastream.user.db.entity.UserEntity;
import org.aquastream.user.db.repository.UserRepository;
import org.aquastream.user.db.entity.RefreshSessionEntity;
import org.aquastream.user.db.repository.RefreshSessionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository users;
    private final RefreshSessionRepository refreshSessions;
    private final PasswordEncoder encoder;

    @Value("${app.jwt.secret:dev-secret-change-me}")
    private String jwtSecretStr;

    @Value("${app.jwt.accessTtlSeconds:900}")
    private long accessTtlSeconds;

    @Value("${app.jwt.refreshTtlSeconds:2592000}")
    private long refreshTtlSeconds;

    @Value("${app.logging.maskPII:true}")
    private boolean maskPii;

    public UUID register(String username, String rawPassword) {
        users.findByUsernameIgnoreCase(username).ifPresent(u -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User already exists");
        });
        UserEntity u = UserEntity.builder()
                .id(UUID.randomUUID())
                .username(username)
                .passwordHash(encoder.encode(rawPassword))
                .role("USER")
                .build();
        UserEntity saved = users.save(u);
        log.info("user.registered username={} id={}", masked(username), saved.getId());
        return saved.getId();
    }

    public String issueAccessToken(UserEntity user, long ttlSeconds) {
        Instant now = Instant.now();
        var key = Keys.hmacShaKeyFor(jwtSecretStr.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("role", user.getRole())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(ttlSeconds)))
                .signWith(key, Jwts.SIG.HS512)
                .compact();
    }

    public UserEntity authenticate(String username, String password) {
        UserEntity user = users.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> unauthorized(username));
        if (!encoder.matches(password, user.getPasswordHash())) {
            throw unauthorized(username);
        }
        log.info("user.auth.success username={} id={}", masked(username), user.getId());
        return user;
    }

    public UUID parseTokenSubject(String jwt) {
        var key = Keys.hmacShaKeyFor(jwtSecretStr.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(jwt)
                .getPayload();
        return UUID.fromString(claims.getSubject());
    }

    public RefreshSessionEntity issueRefreshSession(UUID userId) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(refreshTtlSeconds);
        String jti = UUID.randomUUID().toString().replace("-", "");
        RefreshSessionEntity rs = RefreshSessionEntity.builder()
                .jti(jti)
                .userId(userId)
                .issuedAt(now)
                .expiresAt(exp)
                .build();
        return refreshSessions.save(rs);
    }

    public void revokeRefresh(String jti) {
        refreshSessions.findById(jti).ifPresent(rs -> {
            rs.setRevokedAt(Instant.now());
            refreshSessions.save(rs);
        });
    }

    public Tokens login(String username, String password) {
        UserEntity u = authenticate(username, password);
        String access = issueAccessToken(u, accessTtlSeconds);
        RefreshSessionEntity rs = issueRefreshSession(u.getId());
        return new Tokens(access, rs.getJti());
    }

    public Tokens refresh(UUID userId, String oldJti) {
        revokeRefresh(oldJti);
        UserEntity u = users.findById(userId).orElseThrow();
        String access = issueAccessToken(u, accessTtlSeconds);
        RefreshSessionEntity rs = issueRefreshSession(u.getId());
        return new Tokens(access, rs.getJti());
    }

    public UUID validateRefreshAndGetUser(String jti) {
        RefreshSessionEntity rs = refreshSessions.findById(jti)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh"));
        if (rs.getRevokedAt() != null || rs.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh");
        }
        return rs.getUserId();
    }
    
    /**
     * Revoke all active sessions for a user.
     * Used for password reset, account security events, etc.
     */
    public int revokeAllUserSessions(UUID userId) {
        log.info("user.sessions.revokeAll userId={}", userId);
        return Math.toIntExact(refreshSessions.deleteByUserId(userId));
    }
    
    /**
     * Clean up expired sessions (for scheduled cleanup).
     */
    public int cleanupExpiredSessions() {
        Instant now = Instant.now();
        List<RefreshSessionEntity> expired = refreshSessions.findByExpiresAtBeforeAndRevokedAtIsNull(now);
        
        int count = 0;
        for (RefreshSessionEntity session : expired) {
            session.setRevokedAt(now);
            refreshSessions.save(session);
            count++;
        }
        
        if (count > 0) {
            log.info("user.sessions.cleanup expired={}", count);
        }
        
        return count;
    }

    private ResponseStatusException unauthorized(String username) {
        log.warn("user.auth.fail username={}", masked(username));
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }

    private String masked(String value) {
        if (!maskPii || value == null || value.length() < 3) return value;
        return value.charAt(0) + "***" + value.charAt(value.length() - 1);
    }

    public int getAccessTtlSeconds() {
        return Math.toIntExact(accessTtlSeconds);
    }

    public int getRefreshTtlSeconds() {
        return Math.toIntExact(refreshTtlSeconds);
    }
}
