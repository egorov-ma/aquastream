package org.aquastream.user.db.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "refresh_sessions", schema = "user")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshSessionEntity {
    @Id
    @Column(name = "jti", nullable = false, length = 64)
    private String jti;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "issued_at", nullable = false)
    private Instant issuedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;
}


