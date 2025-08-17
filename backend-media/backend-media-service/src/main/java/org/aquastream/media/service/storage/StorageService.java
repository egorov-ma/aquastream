package org.aquastream.media.service.storage;

public interface StorageService {

    /**
     * Generate presigned URL for uploading a file
     * 
     * @param key Object key/path
     * @param contentType MIME type of the file
     * @param contentLength Size of the file in bytes
     * @return Presigned upload URL
     */
    String generatePresignedUploadUrl(String key, String contentType, long contentLength);

    /**
     * Generate presigned URL for downloading a file
     * 
     * @param key Object key/path
     * @return Presigned download URL
     */
    String generatePresignedDownloadUrl(String key);

    /**
     * Delete an object from storage
     * 
     * @param key Object key/path to delete
     */
    void deleteObject(String key);

    /**
     * Check if object exists in storage
     * 
     * @param key Object key/path
     * @return true if object exists, false otherwise
     */
    boolean objectExists(String key);
}