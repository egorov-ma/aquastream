package org.aquastream.event.db.entity;

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
@Table(name = "organizers", schema = "event")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizerEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "slug", nullable = false, unique = true, length = 100)
    private String slug;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Type(JsonBinaryType.class)
    @Column(name = "contacts", columnDefinition = "jsonb")
    private Map<String, Object> contacts;

    @Column(name = "brand_color", length = 7)
    private String brandColor;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // Связи
    @OneToMany(mappedBy = "organizer", fetch = FetchType.LAZY)
    private List<EventEntity> events;

    @OneToMany(mappedBy = "organizer", fetch = FetchType.LAZY)
    private List<TeamMemberEntity> teamMembers;

    @OneToMany(mappedBy = "organizer", fetch = FetchType.LAZY)
    private List<FaqItemEntity> faqItems;

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