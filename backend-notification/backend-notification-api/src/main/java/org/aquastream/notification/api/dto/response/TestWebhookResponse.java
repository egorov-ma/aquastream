package org.aquastream.notification.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestWebhookResponse {
    private String status;
    private String message;
    private Set<String> processedUpdate;
}

