package org.aquastream.common.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.aquastream.common.domain.DomainConstants;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.slf4j.MDC;

import static org.junit.jupiter.api.Assertions.*;

class CorrelationIdFilterTest {

    @Test
    void putsCorrelationIdIntoMDC() throws Exception {
        CorrelationIdFilter filter = new CorrelationIdFilter();

        HttpServletRequest req = Mockito.mock(HttpServletRequest.class);
        Mockito.when(req.getHeader(DomainConstants.HEADER_REQUEST_ID)).thenReturn(null);

        ServletResponse res = Mockito.mock(ServletResponse.class);
        FilterChain chain = (ServletRequest request, ServletResponse response) -> {
            String v = MDC.get(DomainConstants.LOG_CORRELATION_ID);
            assertNotNull(v);
            assertFalse(v.isBlank());
        };

        filter.doFilter(req, res, chain);

        assertNull(MDC.get(DomainConstants.LOG_CORRELATION_ID));
    }
}


