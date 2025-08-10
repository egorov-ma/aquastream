package org.aquastream.user.db.repo;

import org.aquastream.user.db.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    Optional<UserEntity> findByUsernameIgnoreCase(String username);
    long countByRole(String role);
    Page<UserEntity> findByUsernameContainingIgnoreCase(String q, Pageable pageable);
    Page<UserEntity> findByRole(String role, Pageable pageable);
    Page<UserEntity> findByRoleAndUsernameContainingIgnoreCase(String role, String q, Pageable pageable);
}


