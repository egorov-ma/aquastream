package org.aquastream.payment.service.provider;

import org.aquastream.payment.service.dto.PaymentInitRequest;
import org.aquastream.payment.service.dto.PaymentInitResponse;
import org.aquastream.payment.service.dto.WebhookRequest;

public interface PaymentProvider {

    /**
     * Get provider name
     */
    String getProviderName();

    /**
     * Check if provider is enabled
     */
    boolean isEnabled();

    /**
     * Initialize payment and get widget configuration
     */
    PaymentInitResponse initializePayment(PaymentInitRequest request);

    /**
     * Verify webhook signature
     */
    boolean verifyWebhookSignature(WebhookRequest webhook);

    /**
     * Process webhook event
     */
    void processWebhook(WebhookRequest webhook);

    /**
     * Check payment status from provider
     */
    String checkPaymentStatus(String providerPaymentId);

    /**
     * Cancel payment at provider
     */
    boolean cancelPayment(String providerPaymentId);
}