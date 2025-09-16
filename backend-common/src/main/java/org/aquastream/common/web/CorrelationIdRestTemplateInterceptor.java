package org.aquastream.common.web;

import org.aquastream.common.domain.DomainConstants;
import org.slf4j.MDC;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;

import java.io.IOException;

/**
 * RestTemplate interceptor that automatically adds correlation ID header
 * to outbound requests for cross-service traceability.
 */
public class CorrelationIdRestTemplateInterceptor implements ClientHttpRequestInterceptor {

    @Override
    public ClientHttpResponse intercept(
            HttpRequest request, 
            byte[] body, 
            ClientHttpRequestExecution execution) throws IOException {
        
        // Get correlation ID from MDC (set by CorrelationIdFilter)
        String correlationId = MDC.get(DomainConstants.LOG_CORRELATION_ID);
        
        if (correlationId != null && !correlationId.isBlank()) {
            // Add correlation ID header to outbound request
            request.getHeaders().add(DomainConstants.HEADER_REQUEST_ID, correlationId);
        }
        
        return execution.execute(request, body);
    }
}