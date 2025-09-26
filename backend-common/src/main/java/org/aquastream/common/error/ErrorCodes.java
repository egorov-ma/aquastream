package org.aquastream.common.error;

/**
 * Canonical application error codes used in API responses.
 */
public final class ErrorCodes {

    /** Prevent instantiation of constants holder. */
    private ErrorCodes() {
    }

    /** Validation failed for request payload or parameters. */
    public static final String VALIDATION_FAILED = "validation.failed";
    /** Missing or invalid authentication. */
    public static final String UNAUTHORIZED = "unauthorized";
    /** Authenticated user has no permission to perform the action. */
    public static final String ACCESS_DENIED = "access.denied";
    /** Requested resource not found. */
    public static final String NOT_FOUND = "not.found";
    /** Request conflicts with current state (e.g., duplicate). */
    public static final String CONFLICT = "conflict";
    /** Request is syntactically valid but semantically incorrect. */
    public static final String UNPROCESSABLE = "unprocessable";
    /** Client exceeded allowed rate limits. */
    public static final String RATE_LIMIT_EXCEEDED = "rate.limit-exceeded";
    /** Unexpected server-side error. */
    public static final String INTERNAL_ERROR = "internal.error";
}
