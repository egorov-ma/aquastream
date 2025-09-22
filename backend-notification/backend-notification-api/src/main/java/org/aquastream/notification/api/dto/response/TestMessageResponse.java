package org.aquastream.notification.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestMessageResponse {
    private String status;
    private Long chatId;
    private String message;
    private boolean sent;
}

