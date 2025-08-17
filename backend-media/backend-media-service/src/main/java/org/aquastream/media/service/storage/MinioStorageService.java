package org.aquastream.media.service.storage;

import io.minio.MinioClient;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.errors.MinioException;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.media.service.config.MediaStorageProperties;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MinioStorageService implements StorageService {

    private final MinioClient minioClient;
    private final MediaStorageProperties properties;

    @Override
    public String generatePresignedUploadUrl(String key, String contentType, long contentLength) {
        try {
            log.debug("Generating presigned upload URL for key: {}, contentType: {}, size: {}", 
                    key, contentType, contentLength);

            Map<String, String> extraHeaders = Map.of(
                "Content-Type", contentType,
                "Content-Length", String.valueOf(contentLength)
            );

            return minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                    .method(Method.PUT)
                    .bucket(properties.getBucketName())
                    .object(key)
                    .expiry(Math.toIntExact(properties.getPresignedUrl().getUploadExpiry().toSeconds()))
                    .extraHeaders(extraHeaders)
                    .build()
            );

        } catch (MinioException | IOException | NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("Failed to generate presigned upload URL for key: {}", key, e);
            throw new StorageException("Failed to generate presigned upload URL", e);
        }
    }

    @Override
    public String generatePresignedDownloadUrl(String key) {
        try {
            log.debug("Generating presigned download URL for key: {}", key);

            return minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                    .method(Method.GET)
                    .bucket(properties.getBucketName())
                    .object(key)
                    .expiry(Math.toIntExact(properties.getPresignedUrl().getDownloadExpiry().toSeconds()))
                    .build()
            );

        } catch (MinioException | IOException | NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("Failed to generate presigned download URL for key: {}", key, e);
            throw new StorageException("Failed to generate presigned download URL", e);
        }
    }

    @Override
    public void deleteObject(String key) {
        try {
            log.debug("Deleting object with key: {}", key);

            minioClient.removeObject(
                RemoveObjectArgs.builder()
                    .bucket(properties.getBucketName())
                    .object(key)
                    .build()
            );

            log.info("Successfully deleted object: {}", key);

        } catch (MinioException | IOException | NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("Failed to delete object with key: {}", key, e);
            throw new StorageException("Failed to delete object", e);
        }
    }

    @Override
    public boolean objectExists(String key) {
        try {
            minioClient.statObject(
                io.minio.StatObjectArgs.builder()
                    .bucket(properties.getBucketName())
                    .object(key)
                    .build()
            );
            return true;
        } catch (Exception e) {
            log.debug("Object does not exist: {}", key);
            return false;
        }
    }

    public static class StorageException extends RuntimeException {
        public StorageException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}