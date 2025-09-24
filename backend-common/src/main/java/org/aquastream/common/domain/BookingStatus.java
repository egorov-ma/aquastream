package org.aquastream.common.domain;

/**
 * Status of a booking lifecycle.
 * PENDING -> CONFIRMED -> COMPLETED or EXPIRED/CANCELLED/NO_SHOW
 */
public enum BookingStatus {
    PENDING,
    CONFIRMED,
    COMPLETED,
    EXPIRED,
    CANCELLED,
    NO_SHOW
}

