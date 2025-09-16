package org.aquastream.common.metrics.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.common.metrics.collector.MetricsCollector;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Servlet filter to automatically collect HTTP request metrics
 */
@Component
@Order(1) // Execute early in the filter chain
@RequiredArgsConstructor
@Slf4j
public class MetricsFilter implements Filter {

    private final MetricsCollector metricsCollector;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        if (!(request instanceof HttpServletRequest httpRequest) || 
            !(response instanceof HttpServletResponse httpResponse)) {
            chain.doFilter(request, response);
            return;
        }

        // Skip metrics collection for actuator endpoints and static resources
        String requestURI = httpRequest.getRequestURI();
        if (shouldSkipMetrics(requestURI)) {
            chain.doFilter(request, response);
            return;
        }

        long startTime = System.currentTimeMillis();
        boolean isError = false;

        try {
            chain.doFilter(request, response);
            
            // Check if response indicates an error
            int statusCode = httpResponse.getStatus();
            isError = statusCode >= 400;
            
        } catch (Exception e) {
            isError = true;
            log.debug("Exception in request processing: {}", e.getMessage());
            throw e;
        } finally {
            try {
                long duration = System.currentTimeMillis() - startTime;
                metricsCollector.recordRequest(duration, isError);
                
                log.trace("Recorded request metrics: uri={}, duration={}ms, error={}", 
                        requestURI, duration, isError);
                        
            } catch (Exception e) {
                log.error("Error recording request metrics for {}: {}", requestURI, e.getMessage());
            }
        }
    }

    private boolean shouldSkipMetrics(String requestURI) {
        return requestURI.startsWith("/actuator/") ||
               requestURI.startsWith("/health") ||
               requestURI.startsWith("/info") ||
               requestURI.startsWith("/metrics") ||
               requestURI.startsWith("/static/") ||
               requestURI.startsWith("/css/") ||
               requestURI.startsWith("/js/") ||
               requestURI.startsWith("/images/") ||
               requestURI.endsWith(".css") ||
               requestURI.endsWith(".js") ||
               requestURI.endsWith(".png") ||
               requestURI.endsWith(".jpg") ||
               requestURI.endsWith(".ico") ||
               requestURI.endsWith(".svg");
    }
}