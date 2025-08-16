package org.aquastream.event.db.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import io.hypersistence.utils.hibernate.type.array.StringArrayType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "events", schema = "event")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "organizer_slug", nullable = false, length = 100)
    private String organizerSlug;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_slug", referencedColumnName = "slug", insertable = false, updatable = false)
    private OrganizerEntity organizer;

    @Column(name = "type", nullable = false, length = 50)
    private String type;

    @Column(name = "title", nullable = false, length = 500)
    private String title;

    @Column(name = "date_start", nullable = false)
    private Instant dateStart;

    @Column(name = "date_end", nullable = false)
    private Instant dateEnd;

    @Type(JsonBinaryType.class)
    @Column(name = "location", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> location;

    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    @Column(name = "available", nullable = false)
    private Integer available;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "DRAFT";

    @Type(StringArrayType.class)
    @Column(name = "tags", columnDefinition = "text[]")
    private String[] tags;

    @Column(name = "description", columnDefinition = "text")
    private String description;

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