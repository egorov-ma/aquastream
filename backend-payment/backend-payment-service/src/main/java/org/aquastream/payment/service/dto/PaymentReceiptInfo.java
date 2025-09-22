package org.aquastream.payment.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentReceiptInfo {
    private UUID id;
    private UUID paymentId;
    private String receiptType;
    private Map<String, Object> receiptData;
    private String fiscalReceiptNumber;
    private String fiscalDocumentNumber;
    private String fiscalSign;
    private String ofdReceiptUrl;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant sentAt;
    private Instant registeredAt;
}

