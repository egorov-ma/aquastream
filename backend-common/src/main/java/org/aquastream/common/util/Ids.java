package org.aquastream.common.util;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.UUID;

public final class Ids {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private Ids() {}

    public static String newUuid() {
        return UUID.randomUUID().toString();
    }

    public static String newJti() {
        byte[] bytes = new byte[16];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public static String newIdempotencyKey() {
        byte[] bytes = new byte[24];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}


