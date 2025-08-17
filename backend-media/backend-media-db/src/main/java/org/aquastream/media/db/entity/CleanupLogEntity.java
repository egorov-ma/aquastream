package org.aquastream.media.db.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "cleanup_log", schema = "media")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CleanupLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cleaned_at", nullable = false)
    private Instant cleanedAt;

    @Column(name = "files_deleted", nullable = false)
    @Builder.Default
    private Integer filesDeleted = 0;

    @PrePersist
    protected void onCreate() {
        if (cleanedAt == null) cleanedAt = Instant.now();
    }
}