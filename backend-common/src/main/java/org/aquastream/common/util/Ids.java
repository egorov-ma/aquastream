package org.aquastream.common.util;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.UUID;

/**
 * Utility methods for generating identifiers used across services.
 */
public final class Ids {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    /**
     * Prevent instantiation of utility class.
     */
    private Ids() {
    }

    /**
     * Generate a random UUID string.
     */
    public static String newUuid() {
        return UUID.randomUUID().toString();
    }

    /**
     * Generate a compact JWT ID (JTI) value suitable for tokens.
     */
    public static String newJti() {
        byte[] bytes = new byte[16];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /**
     * Generate an idempotency key for correlating client retries.
     */
    public static String newIdempotencyKey() {
        byte[] bytes = new byte[24];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}

