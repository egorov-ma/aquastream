package org.aquastream.common.domain;

/**
 * Status of a booking lifecycle.
 * PENDING -> CONFIRMED -> COMPLETED or EXPIRED/CANCELLED/NO_SHOW
 */
public enum BookingStatus {
    /** Booking created and awaiting confirmation. */
    PENDING,
    /** Booking confirmed and scheduled. */
    CONFIRMED,
    /** Booking successfully completed. */
    COMPLETED,
    /** Booking expired due to timeout or inactivity. */
    EXPIRED,
    /** Booking cancelled by user or system. */
    CANCELLED,
    /** User did not show up for the booking. */
    NO_SHOW
}
