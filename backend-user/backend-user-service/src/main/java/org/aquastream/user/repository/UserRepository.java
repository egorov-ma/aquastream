package org.aquastream.user.repository;

import org.aquastream.common.domain.user.ERole;
import org.aquastream.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByUsername(String username);
    
    Optional<User> findByTelegramUser(String telegramUser);
    
    Boolean existsByUsername(String username);
    
    Boolean existsByTelegramUser(String telegramUser);
    
    Page<User> findByRole(ERole role, Pageable pageable);
} 