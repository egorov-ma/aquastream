package org.aquastream.payment.api.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentReceiptDto(
        UUID receiptId,
        UUID paymentId,
        String receiptNumber,
        BigDecimal amount,
        String currency,
        String status,
        String receiptUrl,
        String notes,
        Instant submittedAt,
        Instant moderatedAt,
        UUID moderatorId
) {}