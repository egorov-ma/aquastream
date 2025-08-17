package org.aquastream.payment.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebhookRequest {

    private String providerName;
    
    private Map<String, Object> payload;
    
    private Map<String, String> headers;
    
    private String rawBody;
    
    private String signature;
    
    private String sourceIp;
}