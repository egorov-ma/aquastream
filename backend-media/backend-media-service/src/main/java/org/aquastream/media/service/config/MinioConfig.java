package org.aquastream.media.service.config;

import io.minio.MinioClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(MediaStorageProperties.class)
@Slf4j
public class MinioConfig {

    @Bean
    public MinioClient minioClient(MediaStorageProperties properties) {
        log.info("Configuring MinIO client for endpoint: {}", properties.getEndpoint());
        
        return MinioClient.builder()
                .endpoint(properties.getEndpoint())
                .credentials(properties.getAccessKey(), properties.getSecretKey())
                .build();
    }
}