package org.aquastream.user.repository;

import org.aquastream.user.entity.RefreshToken;
import org.aquastream.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByToken(String token);
    int deleteByUser(User user);
} 