package org.aquastream.payment.service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptSubmissionRequest {

    @NotNull(message = "Payment ID is required")
    private UUID paymentId;

    @NotBlank(message = "Receipt image URL is required")
    private String receiptImageUrl;

    private String receiptText;

    private String notes;

    private Map<String, Object> metadata;

    // Submitter information
    private UUID submittedBy;
    
    private String submitterEmail;
    
    private String submitterPhone;
}