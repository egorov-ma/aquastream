package org.aquastream.user.db.entity;

import jakarta.persistence.*;
import java.util.UUID;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Entity
@Table(name = "profiles", schema = "user")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileEntity {
    @Id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "phone")
    private String phone;

    @Column(name = "telegram")
    private String telegram;

    @Column(name = "is_telegram_verified", nullable = false)
    private boolean telegramVerified;
}


