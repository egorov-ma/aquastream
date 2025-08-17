package org.aquastream.crew.db.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "tents", schema = "crew")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TentEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crew_id", nullable = false, unique = true)
    private CrewEntity crew;

    @Column(name = "tent_number", length = 20)
    private String tentNumber;

    @Column(name = "tent_type", nullable = false, length = 50)
    private String tentType;

    @Column(name = "brand", length = 100)
    private String brand;

    @Column(name = "model", length = 100)
    private String model;

    @Column(name = "capacity_persons", nullable = false)
    private Integer capacityPersons;

    @Enumerated(EnumType.STRING)
    @Column(name = "season_rating", length = 20)
    private SeasonRating seasonRating;

    @Column(name = "waterproof_rating")
    private Integer waterproofRating;

    @Enumerated(EnumType.STRING)
    @Column(name = "setup_difficulty", length = 20)
    @Builder.Default
    private SetupDifficulty setupDifficulty = SetupDifficulty.MEDIUM;

    @Column(name = "weight_kg", precision = 5, scale = 2)
    private BigDecimal weightKg;

    @Column(name = "packed_size_cm", length = 50)
    private String packedSizeCm;

    @Enumerated(EnumType.STRING)
    @Column(name = "condition", length = 20)
    @Builder.Default
    private Condition condition = Condition.GOOD;

    @Type(JsonBinaryType.class)
    @Column(name = "equipment", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> equipment = Map.of();

    @Column(name = "maintenance_notes", columnDefinition = "text")
    private String maintenanceNotes;

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

    public enum SeasonRating {
        ONE_SEASON,
        TWO_SEASON,
        THREE_SEASON,
        FOUR_SEASON
    }

    public enum SetupDifficulty {
        EASY,
        MEDIUM,
        HARD
    }

    public enum Condition {
        EXCELLENT,
        GOOD,
        FAIR,
        POOR
    }
}