package org.aquastream.crew.db.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "crew_assignments", schema = "crew")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrewAssignmentEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crew_id", nullable = false)
    private CrewEntity crew;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "booking_id", nullable = false)
    private UUID bookingId;

    @Column(name = "seat_number")
    private Integer seatNumber;

    @Column(name = "position", length = 50)
    private String position;

    @Column(name = "assigned_by", nullable = false)
    private UUID assignedBy;

    @Column(name = "assigned_at", nullable = false)
    private Instant assignedAt;

    @Column(name = "unassigned_at")
    private Instant unassignedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private AssignmentStatus status = AssignmentStatus.ACTIVE;

    @Column(name = "notes", columnDefinition = "text")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
        if (assignedAt == null) assignedAt = Instant.now();
    }

    public enum AssignmentStatus {
        ACTIVE,      // Активное назначение
        REMOVED,     // Удалено
        TRANSFERRED  // Переведено в другую группу
    }
}