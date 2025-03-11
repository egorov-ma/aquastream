package org.aquastream.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    private String name;
    
    @Column(unique = true)
    private String username;
    
    private String password;
    
    @Column(name = "telegram_user", unique = true)
    private String telegramUser;
    
    @Column(name = "telegram_chat_id")
    private String telegramChatId;
    
    private String phone;
    
    @Column(name = "is_active")
    private boolean isActive;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private ERole role;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 