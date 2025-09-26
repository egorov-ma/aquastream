package org.aquastream.common.error;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.context.annotation.Import;

/**
 * Spring Boot auto-configuration that registers the global exception handler for backend services.
 */
@AutoConfiguration
@Import(GlobalExceptionHandler.class)
public class CommonErrorHandlingAutoConfiguration {

    /**
     * Creates auto-configuration that wires a {@link GlobalExceptionHandler} into the context.
     */
    public CommonErrorHandlingAutoConfiguration() {
    }
}

