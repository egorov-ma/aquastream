package org.aquastream.media.db.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.net.InetAddress;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "files", schema = "media",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = "key")
       })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaFileEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "key", nullable = false, unique = true, length = 255)
    private String key;

    @Column(name = "owner_type", nullable = false, length = 50)
    private String ownerType;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(name = "checksum", nullable = false, length = 64)
    private String checksum;

    @Column(name = "content_type", nullable = false)
    private String contentType;

    @Column(name = "size_bytes", nullable = false)
    private Long sizeBytes;

    @Column(name = "original_filename", length = 500)
    private String originalFilename;

    @Column(name = "upload_session_id")
    private UUID uploadSessionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private FileStatus status = FileStatus.UPLOADED;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", nullable = false, length = 20)
    @Builder.Default
    private FileVisibility visibility = FileVisibility.PRIVATE;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "uploaded_by")
    private UUID uploadedBy;

    @Column(name = "uploaded_from_ip")
    private InetAddress uploadedFromIp;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public enum FileStatus {
        UPLOADING,    // File is being uploaded
        UPLOADED,     // File upload completed
        PROCESSING,   // File is being processed (e.g., image resizing)
        READY,        // File is ready for use
        DELETED       // File marked for deletion
    }

    public enum FileVisibility {
        PRIVATE,      // Only owner can access
        PUBLIC,       // Anyone can access
        UNLISTED      // Accessible via direct link only
    }

    public enum OwnerType {
        USER("user"),
        EVENT("event"),
        ORGANIZER("organizer"),
        PROFILE("profile"),
        SYSTEM("system");

        private final String value;

        OwnerType(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        public static OwnerType fromValue(String value) {
            for (OwnerType type : values()) {
                if (type.value.equals(value)) {
                    return type;
                }
            }
            throw new IllegalArgumentException("Unknown owner type: " + value);
        }
    }
}