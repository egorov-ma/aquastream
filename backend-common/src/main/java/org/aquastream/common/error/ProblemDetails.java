package org.aquastream.common.error;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import lombok.Getter;
import lombok.Setter;

import java.net.URI;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * RFC 7807 compatible problem details representation for API error responses.
 */
@Setter
@Getter
@JsonInclude(Include.NON_NULL)
public final class ProblemDetails {

    /** Media type for problem details JSON. */
    public static final String MEDIA_TYPE = "application/problem+json";

    private URI type;
    private String title;
    private Integer status;
    private String detail;
    private String instance;
    private String code;
    private String correlationId;
    private Instant timestamp;
    private List<FieldError> errors;
    private Map<String, Object> extensions;

    /**
     * Creates a problem details instance with current timestamp.
     */
    public ProblemDetails() {
        this.timestamp = Instant.now();
    }

    /**
     * Field-level validation error descriptor.
     */
    @Setter
    @Getter
    @JsonInclude(Include.NON_NULL)
    public static final class FieldError {
        private String field;
        private String message;
        private String code;

        /** Default constructor for deserialization frameworks. */
        public FieldError() {}

        /**
         * Construct a field error.
         * @param field   the invalid field name
         * @param message user-facing description of the problem
         * @param code    machine-readable error code
         */
        public FieldError(String field, String message, String code) {
            this.field = field;
            this.message = message;
            this.code = code;
        }

    }
}

