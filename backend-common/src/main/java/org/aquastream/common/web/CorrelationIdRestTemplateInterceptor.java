package org.aquastream.common.web;

import org.aquastream.common.domain.DomainConstants;
import org.slf4j.MDC;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.lang.NonNull;

import java.io.IOException;

/**
 * RestTemplate interceptor that automatically adds correlation ID header
 * to outbound requests for cross-service traceability.
 */
public class CorrelationIdRestTemplateInterceptor implements ClientHttpRequestInterceptor {

    /**
     * Creates interceptor that propagates correlation ID header to outbound requests.
     */
    public CorrelationIdRestTemplateInterceptor() {
    }

    @Override
    public @NonNull ClientHttpResponse intercept(
            @NonNull HttpRequest request,
            @NonNull byte[] body,
            @NonNull ClientHttpRequestExecution execution) throws IOException {
        
        // Get correlation ID from MDC (set by CorrelationIdFilter)
        String correlationId = MDC.get(DomainConstants.LOG_CORRELATION_ID);
        
        if (correlationId != null && !correlationId.isBlank()) {
            // Add correlation ID header to outbound request
            request.getHeaders().add(DomainConstants.HEADER_REQUEST_ID, correlationId);
        }
        
        return execution.execute(request, body);
    }
}
