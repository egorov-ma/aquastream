package org.aquastream.media.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.media.service.dto.PresignedUrlRequest;
import org.aquastream.media.service.dto.PresignedUrlResponse;
import org.aquastream.media.service.MediaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/media")
@RequiredArgsConstructor
@Validated
@Slf4j
public class MediaController {

    private final MediaService mediaService;

    @PostMapping("/presign")
    public ResponseEntity<PresignedUrlResponse> generatePresignedUploadUrl(
            @Valid @RequestBody PresignedUrlRequest request) {
        
        log.info("Received presigned URL request for owner: {}/{}, type: {}, size: {}", 
                request.getOwnerType(), request.getOwnerId(), 
                request.getContentType(), request.getContentLength());

        PresignedUrlResponse response = mediaService.generatePresignedUploadUrl(request);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/download/{key}")
    public ResponseEntity<PresignedUrlResponse> generatePresignedDownloadUrl(
            @PathVariable String key) {
        
        log.info("Received download URL request for key: {}", key);

        PresignedUrlResponse response = mediaService.generatePresignedDownloadUrl(key);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/confirm/{key}")
    public ResponseEntity<Void> confirmUpload(
            @PathVariable String key,
            @RequestParam(required = false) String checksum) {
        
        log.info("Confirming upload for key: {}", key);

        mediaService.markFileAsUploaded(key, checksum);
        
        return ResponseEntity.ok().build();
    }
}