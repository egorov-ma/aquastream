package org.aquastream.user.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import lombok.RequiredArgsConstructor;
import org.aquastream.user.db.entity.UserEntity;
import org.aquastream.user.db.repo.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final byte[] jwtSecret = "dev-secret-change-me".getBytes();

    public UserEntity register(String username, String rawPassword) {
        UserEntity u = UserEntity.builder()
                .id(UUID.randomUUID())
                .username(username)
                .passwordHash(encoder.encode(rawPassword))
                .role("USER")
                .build();
        return users.save(u);
    }

    public String issueAccessToken(UserEntity user, long ttlSeconds) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setSubject(user.getId().toString())
                .claim("role", user.getRole())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(ttlSeconds)))
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }

    public UserEntity authenticate(String username, String password) {
        UserEntity user = users.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        if (!encoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }
        return user;
    }

    public UUID parseTokenSubject(String jwt) {
        Claims claims = Jwts.parser()
                .setSigningKey(jwtSecret)
                .build()
                .parseSignedClaims(jwt)
                .getPayload();
        return UUID.fromString(claims.getSubject());
    }
}


