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
@Table(name = "boats", schema = "crew")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoatEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crew_id", nullable = false, unique = true)
    private CrewEntity crew;

    @Column(name = "boat_number", length = 20)
    private String boatNumber;

    @Column(name = "boat_type", nullable = false, length = 50)
    private String boatType;

    @Column(name = "brand", length = 100)
    private String brand;

    @Column(name = "model", length = 100)
    private String model;

    @Column(name = "year_manufactured")
    private Integer yearManufactured;

    @Column(name = "length_meters", precision = 4, scale = 2)
    private BigDecimal lengthMeters;

    @Column(name = "max_weight_kg")
    private Integer maxWeightKg;

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

    @Column(name = "last_inspection")
    private Instant lastInspection;

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

    public enum Condition {
        EXCELLENT,
        GOOD,
        FAIR,
        POOR
    }
}