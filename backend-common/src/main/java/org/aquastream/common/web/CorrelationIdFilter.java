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

public class CorrelationIdFilter implements Filter {

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


