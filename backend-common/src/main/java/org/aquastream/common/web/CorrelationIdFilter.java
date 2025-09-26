package org.aquastream.common.web;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.aquastream.common.domain.DomainConstants;
import org.aquastream.common.util.Ids;
import org.slf4j.MDC;

import java.io.IOException;

/**
 * Servlet filter that ensures every request has a correlation ID available in the logging MDC.
 *
 * <p>It tries to read the ID from the header {@code X-Request-Id} and, if absent, generates a new
 * opaque identifier. The value is stored in MDC under {@code correlationId} for the duration of
 * request processing.</p>
 */
public class CorrelationIdFilter implements Filter {

    /**
     * Creates a filter that manages correlation IDs in MDC for incoming requests.
     */
    public CorrelationIdFilter() {
    }

    /**
     * Puts correlation ID into MDC, delegates to the next filter, and finally clears the MDC key.
     *
     * @param request  current request
     * @param response current response
     * @param chain    filter chain to continue processing
     * @throws IOException      if an I/O error occurs during filtering
     * @throws ServletException if the processing fails
     */
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        String correlationId = null;
        try {
            if (request instanceof HttpServletRequest http) {
                correlationId = http.getHeader(DomainConstants.HEADER_REQUEST_ID);
            }
            if (correlationId == null || correlationId.isBlank()) {
                correlationId = Ids.newIdempotencyKey();
            }
            MDC.put(DomainConstants.LOG_CORRELATION_ID, correlationId);
            chain.doFilter(request, response);
        } finally {
            MDC.remove(DomainConstants.LOG_CORRELATION_ID);
        }
    }
}

