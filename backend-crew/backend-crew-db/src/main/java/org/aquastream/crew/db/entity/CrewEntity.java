package org.aquastream.crew.db.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "crews", schema = "crew",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"event_id", "name"})
       })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrewEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "event_id", nullable = false)
    private UUID eventId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private CrewType type;

    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    @Column(name = "current_size", nullable = false)
    @Builder.Default
    private Integer currentSize = 0;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Type(JsonBinaryType.class)
    @Column(name = "metadata", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> metadata = Map.of();

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // Relationships
    @OneToMany(mappedBy = "crew", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<CrewAssignmentEntity> assignments;

    @OneToOne(mappedBy = "crew", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private BoatEntity boat;

    @OneToOne(mappedBy = "crew", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private TentEntity tent;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public enum CrewType {
        CREW,    // Экипаж лодки
        TENT,    // Палатка
        TABLE,   // Стол на банкете
        BUS      // Место в автобусе
    }
}