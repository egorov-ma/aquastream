package org.aquastream.common.web;

import org.aquastream.common.domain.DomainConstants;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpResponse;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CorrelationIdRestTemplateInterceptorTest {

    private CorrelationIdRestTemplateInterceptor interceptor;
    private HttpRequest request;
    private ClientHttpRequestExecution execution;
    private ClientHttpResponse response;

    @BeforeEach
    void setUp() {
        interceptor = new CorrelationIdRestTemplateInterceptor();
        request = mock(HttpRequest.class);
        execution = mock(ClientHttpRequestExecution.class);
        response = mock(ClientHttpResponse.class);
        
        HttpHeaders headers = new HttpHeaders();
        when(request.getHeaders()).thenReturn(headers);
    }

    @AfterEach
    void tearDown() {
        MDC.clear();
    }

    @Test
    void testInterceptAddsCorrelationIdWhenPresentInMDC() throws Exception {
        // Given
        String expectedCorrelationId = "test-correlation-id";
        MDC.put(DomainConstants.LOG_CORRELATION_ID, expectedCorrelationId);
        when(execution.execute(request, new byte[0])).thenReturn(response);

        // When
        ClientHttpResponse result = interceptor.intercept(request, new byte[0], execution);

        // Then
        assertSame(response, result);
        verify(execution).execute(request, new byte[0]);
        assertEquals(expectedCorrelationId, 
                request.getHeaders().getFirst(DomainConstants.HEADER_REQUEST_ID));
    }

    @Test
    void testInterceptDoesNotAddHeaderWhenCorrelationIdNotInMDC() throws Exception {
        // Given
        when(execution.execute(request, new byte[0])).thenReturn(response);

        // When
        ClientHttpResponse result = interceptor.intercept(request, new byte[0], execution);

        // Then
        assertSame(response, result);
        verify(execution).execute(request, new byte[0]);
        assertNull(request.getHeaders().getFirst(DomainConstants.HEADER_REQUEST_ID));
    }

    @Test
    void testInterceptDoesNotAddHeaderWhenCorrelationIdIsBlank() throws Exception {
        // Given
        MDC.put(DomainConstants.LOG_CORRELATION_ID, "");
        when(execution.execute(request, new byte[0])).thenReturn(response);

        // When
        ClientHttpResponse result = interceptor.intercept(request, new byte[0], execution);

        // Then
        assertSame(response, result);
        verify(execution).execute(request, new byte[0]);
        assertNull(request.getHeaders().getFirst(DomainConstants.HEADER_REQUEST_ID));
    }
}