package org.aquastream.user.db.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "recovery_codes", schema = "user")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(RecoveryCodeId.class)
public class RecoveryCodeEntity {
    @Id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Id
    @Column(name = "code_hash", nullable = false)
    private String codeHash;

    @Column(name = "used_at")
    private Instant usedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;
}


