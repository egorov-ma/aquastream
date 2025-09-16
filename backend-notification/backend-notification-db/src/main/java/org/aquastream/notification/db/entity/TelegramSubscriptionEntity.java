package org.aquastream.notification.db.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "telegram_subscriptions", schema = "notification")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class TelegramSubscriptionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Size(max = 32)
    @Column(name = "telegram_username", length = 32)
    private String telegramUsername;

    @Column(name = "telegram_chat_id", nullable = false, unique = true)
    private Long telegramChatId;

    @Column(name = "telegram_user_id", nullable = false, unique = true)
    private Long telegramUserId;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Size(max = 32)
    @Column(name = "link_code", length = 32)
    private String linkCode;

    @Column(name = "link_expires_at")
    private Instant linkExpiresAt;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // Helper methods for verification status
    public boolean isVerified() {
        return verifiedAt != null;
    }

    public boolean isLinkCodeValid() {
        return linkCode != null && 
               linkExpiresAt != null && 
               linkExpiresAt.isAfter(Instant.now());
    }

    public boolean canReceiveMessages() {
        return isActive && isVerified();
    }

    // Mark as verified
    public void markAsVerified() {
        this.verifiedAt = Instant.now();
        this.linkCode = null;
        this.linkExpiresAt = null;
        this.isActive = true;
    }

    // Generate link code for verification
    public void generateLinkCode(String code, Instant expiresAt) {
        this.linkCode = code;
        this.linkExpiresAt = expiresAt;
    }

    // Deactivate subscription
    public void deactivate() {
        this.isActive = false;
    }
}