package org.aquastream.payment.service.receipt;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.payment.db.entity.PaymentEntity;
import org.aquastream.payment.db.entity.PaymentReceiptEntity;
import org.aquastream.payment.db.repository.PaymentReceiptRepository;
import org.aquastream.payment.db.repository.PaymentRepository;
import org.aquastream.payment.service.dto.ReceiptSubmissionRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ReceiptService {

    private final PaymentRepository paymentRepository;
    private final PaymentReceiptRepository receiptRepository;
    private final ReceiptModerationService moderationService;

    public UUID submitReceipt(UUID paymentId, ReceiptSubmissionRequest request) {
        log.info("Submitting receipt for payment: {}", paymentId);

        // Validate payment exists and is in correct status
        PaymentEntity payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                        "Payment not found"));

        if (payment.getStatus() != PaymentEntity.PaymentStatus.SUCCEEDED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Receipt can only be submitted for successful payments");
        }

        // Check if receipt already exists
        boolean hasExistingReceipt = receiptRepository.existsByPaymentIdAndStatus(
                paymentId, PaymentReceiptEntity.ReceiptStatus.REGISTERED);

        if (hasExistingReceipt) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, 
                    "Receipt already exists for this payment");
        }

        // Validate receipt image URL
        validateReceiptImage(request.getReceiptImageUrl());

        // Create receipt entity
        PaymentReceiptEntity receipt = PaymentReceiptEntity.builder()
                .paymentId(paymentId)
                .receiptType(PaymentReceiptEntity.ReceiptType.PAYMENT)
                .receiptData(Map.of(
                    "receipt_image_url", request.getReceiptImageUrl(),
                    "receipt_text", request.getReceiptText() != null ? request.getReceiptText() : "",
                    "notes", request.getNotes() != null ? request.getNotes() : "",
                    "submitted_by", request.getSubmittedBy(),
                    "submitter_email", request.getSubmitterEmail(),
                    "submitter_phone", request.getSubmitterPhone(),
                    "metadata", request.getMetadata() != null ? request.getMetadata() : Map.of()
                ))
                .status(PaymentReceiptEntity.ReceiptStatus.PENDING)
                .build();

        receipt = receiptRepository.save(receipt);
        log.info("Created receipt entity with ID: {}", receipt.getId());

        // Start moderation process
        moderationService.startModeration(receipt);

        return receipt.getId();
    }

    public void moderateReceipt(UUID receiptId, boolean approved, String moderatorNotes, UUID moderatorId) {
        log.info("Moderating receipt: {}, approved: {}", receiptId, approved);

        PaymentReceiptEntity receipt = receiptRepository.findById(receiptId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                        "Receipt not found"));

        if (receipt.getStatus() != PaymentReceiptEntity.ReceiptStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Receipt is not pending moderation");
        }

        // Update receipt status
        PaymentReceiptEntity.ReceiptStatus newStatus = approved ? 
                PaymentReceiptEntity.ReceiptStatus.REGISTERED : 
                PaymentReceiptEntity.ReceiptStatus.FAILED;

        receipt.setStatus(newStatus);
        receipt.setUpdatedAt(Instant.now());

        if (approved) {
            receipt.setRegisteredAt(Instant.now());
        }

        // Add moderation details to receipt data
        Map<String, Object> receiptData = receipt.getReceiptData();
        receiptData.put("moderation_result", approved ? "approved" : "rejected");
        receiptData.put("moderator_notes", moderatorNotes);
        receiptData.put("moderator_id", moderatorId);
        receiptData.put("moderated_at", Instant.now().toString());

        receipt.setReceiptData(receiptData);
        receiptRepository.save(receipt);

        log.info("Receipt {} moderation completed: {}", receiptId, approved ? "approved" : "rejected");

        // Send notification
        moderationService.sendModerationNotification(receipt, approved, moderatorNotes);
    }

    public PaymentReceiptEntity getReceipt(UUID receiptId) {
        return receiptRepository.findById(receiptId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                        "Receipt not found"));
    }

    public PaymentReceiptEntity getReceiptByPayment(UUID paymentId) {
        return receiptRepository.findLastReceiptByPayment(paymentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                        "No receipt found for payment"));
    }

    private void validateReceiptImage(String receiptImageUrl) {
        if (receiptImageUrl == null || receiptImageUrl.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Receipt image URL is required");
        }

        // Validate URL format
        if (!receiptImageUrl.startsWith("http://") && !receiptImageUrl.startsWith("https://")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Invalid receipt image URL format");
        }

        // Additional validation could include:
        // - URL accessibility check
        // - Image format validation
        // - File size limits
        // - Virus scanning
        
        log.debug("Receipt image URL validated: {}", receiptImageUrl);
    }
}