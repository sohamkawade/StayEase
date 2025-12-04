package com.stayease.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stayease.dto.PaymentOrderRequest;
import com.stayease.dto.PaymentVerificationRequest;
import com.stayease.services.PaymentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

	private final PaymentService paymentService;

	@PostMapping("/create-order")
	public ResponseEntity<?> createOrder(@RequestBody PaymentOrderRequest request) {
		return paymentService.createOrder(
				request.getBookingId(),
				request.getAmount(),
				request.getCurrency() != null ? request.getCurrency() : "INR");
	}

	@PostMapping("/verify")
	public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerificationRequest request) {
		return paymentService.verifyPayment(
				request.getBookingId(),
				request.getRazorpayOrderId(),
				request.getRazorpayPaymentId(),
				request.getRazorpaySignature());
	}

	@PostMapping("/failed")
	public ResponseEntity<?> markPaymentFailed(@RequestBody PaymentVerificationRequest request) {
		return paymentService.markPaymentFailed(request.getBookingId());
	}

	@PostMapping("/cancel")
	public ResponseEntity<?> cancelPayment(@RequestBody PaymentVerificationRequest request) {
		return paymentService.cancelPaymentAndDeleteBooking(request.getBookingId());
	}
}

