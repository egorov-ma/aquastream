package org.aquastream.notification.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SamplePayloadsResponse {
    private Map<String, Object> startWithCode;
    private Map<String, Object> helpCommand;
    private String description;
}

