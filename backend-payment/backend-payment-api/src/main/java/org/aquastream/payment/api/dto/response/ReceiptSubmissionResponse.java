package org.aquastream.payment.api.dto.response;

import java.util.UUID;

public record ReceiptSubmissionResponse(
        UUID receiptId,
        String status,
        String message
) {}