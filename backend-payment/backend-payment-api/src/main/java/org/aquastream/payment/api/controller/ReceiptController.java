package org.aquastream.payment.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.payment.service.dto.PaymentReceiptInfo;
import org.aquastream.payment.service.dto.ReceiptSubmissionRequest;
import org.aquastream.payment.service.receipt.ReceiptService;
import org.aquastream.payment.api.dto.response.ReceiptSubmissionResponse;
import org.aquastream.payment.api.dto.response.PaymentReceiptDto;
import org.aquastream.payment.api.dto.response.ModerationResponse;
import org.aquastream.payment.api.dto.request.ModerationRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Validated
@Slf4j
public class ReceiptController {

    private final ReceiptService receiptService;

    @PostMapping("/{paymentId}/receipt")
    public ResponseEntity<ReceiptSubmissionResponse> submitReceipt(
            @PathVariable UUID paymentId,
            @Valid @RequestBody ReceiptSubmissionRequest request) {

        log.info("Submitting receipt for payment: {}", paymentId);

        request.setPaymentId(paymentId);

        UUID receiptId = receiptService.submitReceipt(paymentId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ReceiptSubmissionResponse(receiptId, "pending_moderation", "Receipt submitted for moderation")
        );
    }

    @GetMapping("/{paymentId}/receipt")
    public ResponseEntity<PaymentReceiptDto> getReceipt(@PathVariable UUID paymentId) {
        log.info("Getting receipt for payment: {}", paymentId);

        PaymentReceiptInfo receipt = receiptService.getReceiptByPayment(paymentId);
        PaymentReceiptDto dto = mapToTransportDto(receipt);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/receipts/{receiptId}/moderate")
    public ResponseEntity<ModerationResponse> moderateReceipt(
            @PathVariable UUID receiptId,
            @Valid @RequestBody ModerationRequest request) {

        log.info("Moderating receipt: {}", receiptId);

        receiptService.moderateReceipt(receiptId, request.approved(), request.notes(), request.moderatorId());

        return ResponseEntity.ok(new ModerationResponse(
                "success",
                request.approved() ? "approved" : "rejected"
        ));
    }

    @GetMapping("/receipts/{receiptId}")
    public ResponseEntity<PaymentReceiptDto> getReceiptById(@PathVariable UUID receiptId) {
        log.info("Getting receipt by ID: {}", receiptId);

        PaymentReceiptInfo receipt = receiptService.getReceipt(receiptId);
        PaymentReceiptDto dto = mapToTransportDto(receipt);
        return ResponseEntity.ok(dto);
    }

    private PaymentReceiptDto mapToTransportDto(PaymentReceiptInfo serviceDto) {
        return new PaymentReceiptDto(
                serviceDto.getId(),
                serviceDto.getPaymentId(),
                serviceDto.getFiscalReceiptNumber(),
                null, // amount not available in service DTO
                "RUB", // default currency
                serviceDto.getStatus(),
                serviceDto.getOfdReceiptUrl(),
                null, // notes not available in service DTO
                serviceDto.getCreatedAt(),
                serviceDto.getUpdatedAt(),
                null // moderatorId not available in service DTO
        );
    }
}
