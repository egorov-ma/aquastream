package org.aquastream.payment.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.payment.db.entity.PaymentReceiptEntity;
import org.aquastream.payment.service.dto.ReceiptSubmissionRequest;
import org.aquastream.payment.service.receipt.ReceiptService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Validated
@Slf4j
public class ReceiptController {

    private final ReceiptService receiptService;

    @PostMapping("/{paymentId}/receipt")
    public ResponseEntity<Map<String, Object>> submitReceipt(
            @PathVariable UUID paymentId,
            @Valid @RequestBody ReceiptSubmissionRequest request) {

        log.info("Submitting receipt for payment: {}", paymentId);

        request.setPaymentId(paymentId);

        UUID receiptId = receiptService.submitReceipt(paymentId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "receiptId", receiptId,
                "status", "pending_moderation",
                "message", "Receipt submitted for moderation"
        ));
    }

    @GetMapping("/{paymentId}/receipt")
    public ResponseEntity<PaymentReceiptEntity> getReceipt(@PathVariable UUID paymentId) {
        log.info("Getting receipt for payment: {}", paymentId);

        PaymentReceiptEntity receipt = receiptService.getReceiptByPayment(paymentId);

        return ResponseEntity.ok(receipt);
    }

    @PostMapping("/receipts/{receiptId}/moderate")
    public ResponseEntity<Map<String, String>> moderateReceipt(
            @PathVariable UUID receiptId,
            @RequestBody Map<String, Object> moderationRequest) {

        log.info("Moderating receipt: {}", receiptId);

        boolean approved = (Boolean) moderationRequest.get("approved");
        String notes = (String) moderationRequest.get("notes");
        UUID moderatorId = UUID.fromString((String) moderationRequest.get("moderatorId"));

        receiptService.moderateReceipt(receiptId, approved, notes, moderatorId);

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "result", approved ? "approved" : "rejected"
        ));
    }

    @GetMapping("/receipts/{receiptId}")
    public ResponseEntity<PaymentReceiptEntity> getReceiptById(@PathVariable UUID receiptId) {
        log.info("Getting receipt by ID: {}", receiptId);

        PaymentReceiptEntity receipt = receiptService.getReceipt(receiptId);

        return ResponseEntity.ok(receipt);
    }
}