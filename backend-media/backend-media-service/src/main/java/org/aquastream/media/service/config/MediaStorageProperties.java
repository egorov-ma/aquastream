package org.aquastream.media.service.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;
import java.util.Map;

@Data
@ConfigurationProperties(prefix = "app.media.storage")
public class MediaStorageProperties {

    private String endpoint = "http://localhost:9000";
    private String accessKey = "minioadmin";
    private String secretKey = "minioadmin";
    private String bucketName = "aquastream-media";
    private String region = "us-east-1";
    
    private PresignedUrl presignedUrl = new PresignedUrl();
    private FileLimits files = new FileLimits();
    private Retention retention = new Retention();
    
    @Data
    public static class PresignedUrl {
        private Duration uploadExpiry = Duration.ofMinutes(15);
        private Duration downloadExpiry = Duration.ofHours(1);
    }
    
    @Data
    public static class FileLimits {
        private long maxPhotoMb = 5;
        private long maxProofMb = 5;
        private long maxDocumentMb = 10;
        private long maxVideoMb = 50;
        
        private Map<String, Long> maxSizeByType = Map.of(
            "image/jpeg", maxPhotoMb * 1024 * 1024,
            "image/png", maxPhotoMb * 1024 * 1024,
            "image/webp", maxPhotoMb * 1024 * 1024,
            "application/pdf", maxProofMb * 1024 * 1024,
            "image/tiff", maxProofMb * 1024 * 1024
        );
    }
    
    @Data
    public static class Retention {
        private int proofsDays = 90;
        private int tempFilesDays = 1;
        private int logRetentionDays = 365;
    }
}