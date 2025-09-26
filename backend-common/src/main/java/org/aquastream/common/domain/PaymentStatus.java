package org.aquastream.common.domain;

/**
 * Payment status enumeration for booking-payment integration.
 * <p>
 * Status flow:
 * - NOT_REQUIRED: Free events
 * - PENDING: Payment created but not submitted
 * - SUBMITTED: Payment submitted to payment provider
 * - SUCCEEDED: Payment completed successfully
 * - REJECTED: Payment rejected by provider or manual review
 * - CANCELED: Payment cancelled by user
 * <p>
 * Legacy statuses (for existing payment service):
 * - INIT, SUCCESS, FAILED, REFUNDED
 */
public enum PaymentStatus {
    // Booking-specific statuses
    NOT_REQUIRED,  // Free events don't require payment
    PENDING,       // Payment record created but not submitted
    SUBMITTED,     // Payment submitted to provider
    SUCCEEDED,     // Payment completed successfully
    REJECTED,      // Payment rejected (by provider or manual review)
    CANCELED,      // Payment cancelled by user
    
    // Legacy statuses (existing payment service)
    INIT,          // Legacy: initial payment state
    SUCCESS,       // Legacy: successful payment (same as SUCCEEDED)
    FAILED,        // Legacy: failed payment (same as REJECTED)
    REFUNDED       // Legacy: payment refunded
}


