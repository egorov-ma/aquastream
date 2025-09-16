package org.aquastream.user.db.repository;

import org.aquastream.user.db.entity.ProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProfileRepository extends JpaRepository<ProfileEntity, UUID> {
}


