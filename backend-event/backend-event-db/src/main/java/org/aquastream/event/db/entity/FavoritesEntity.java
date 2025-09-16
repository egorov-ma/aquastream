package org.aquastream.event.db.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Entity representing user's favorite events.
 * 
 * Uses composite primary key (user_id, event_id) as defined in SQL schema.
 * No foreign key constraint to user table due to cross-schema reference.
 */
@Entity
@Table(name = "favorites", schema = "event")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class FavoritesEntity {
    
    @EmbeddedId
    @EqualsAndHashCode.Include
    private FavoritesId id;
    
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
    
    // JoinColumn for event relationship using the embedded ID
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", insertable = false, updatable = false)
    private EventEntity event;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
    
    /**
     * Composite primary key for favorites table.
     */
    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class FavoritesId {
        
        @Column(name = "user_id", nullable = false)
        private UUID userId;
        
        @Column(name = "event_id", nullable = false)
        private UUID eventId;
        
        @Override
        public String toString() {
            return "FavoritesId{userId=" + userId + ", eventId=" + eventId + "}";
        }
    }
    
    @Override
    public String toString() {
        return "FavoritesEntity{" +
                "id=" + id +
                ", createdAt=" + createdAt +
                '}';
    }
}