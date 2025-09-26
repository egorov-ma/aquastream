package org.aquastream.common.domain;

/**
 * Roles for users within the AquaStream platform.
 */
public enum UserRole {
    /** Unauthenticated or limited-access user. */
    GUEST,
    /** Regular authenticated user. */
    USER,
    /** Event organizer or creator. */
    ORGANIZER,
    /** Platform administrator. */
    ADMIN
}

