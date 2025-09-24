package org.aquastream.common.error;

import lombok.Getter;

/**
 * Runtime API exception carrying HTTP status and an application error code.
 */
@Getter
public class ApiException extends RuntimeException {
    private final int status;
    private final String code;

    /**
     * Create an API exception.
     *
     * @param status  HTTP status code to return
     * @param code    application-specific error code
     * @param message human-readable error message
     */
    public ApiException(int status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

