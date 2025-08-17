package org.aquastream.crew.db.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.array.StringArrayType;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "team_preferences", schema = "crew",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"user_id", "event_id"})
       })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamPreferencesEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "event_id", nullable = false)
    private UUID eventId;

    @Type(StringArrayType.class)
    @Column(name = "prefers_with_user_ids", columnDefinition = "uuid[]")
    @Builder.Default
    private UUID[] prefersWithUserIds = new UUID[0];

    @Type(StringArrayType.class)
    @Column(name = "avoids_user_ids", columnDefinition = "uuid[]")
    @Builder.Default
    private UUID[] avoidsUserIds = new UUID[0];

    @Type(StringArrayType.class)
    @Column(name = "preferred_crew_types", columnDefinition = "varchar(20)[]")
    @Builder.Default
    private String[] preferredCrewTypes = new String[0];

    @Type(StringArrayType.class)
    @Column(name = "preferred_positions", columnDefinition = "varchar(50)[]")
    @Builder.Default
    private String[] preferredPositions = new String[0];

    @Column(name = "special_requirements", columnDefinition = "text")
    private String specialRequirements;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}