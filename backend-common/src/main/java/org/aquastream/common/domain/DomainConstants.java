package org.aquastream.common.domain;

/**
 * Shared string constants used across backend services (headers, MDC keys, etc.).
 */
public final class DomainConstants {
    /** Prevent instantiation. */
    private DomainConstants() {
    }

    /** Name of the HTTP header carrying request correlation ID. */
    public static final String HEADER_REQUEST_ID = "X-Request-Id";
    /** Name of the HTTP header carrying authenticated user ID. */
    public static final String HEADER_USER_ID = "X-User-Id";
    /** Name of the HTTP header carrying authenticated user role. */
    public static final String HEADER_USER_ROLE = "X-User-Role";
    /** MDC key used to store current request correlation ID. */
    public static final String LOG_CORRELATION_ID = "correlationId";
}
