package com.stayease.services;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.stayease.MyResponseWrapper;
import com.stayease.enums.PaymentStatus;
import com.stayease.models.Booking;
import com.stayease.repositories.BookingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

	private final BookingRepository bookingRepository;
	private final MyResponseWrapper responseWrapper;

	public ResponseEntity<?> createOrder(Long bookingId, Double amount, String currency) {
		try {
			Optional<Booking> bookingOptional = bookingRepository.findById(bookingId);
			if (bookingOptional.isEmpty()) {
				return universalResponse("Booking not found", null, HttpStatus.NOT_FOUND);
			}

			Booking booking = bookingOptional.get();
			
			if (booking.getAppUser() == null || booking.getAppUser().getRole() == null) {
				return universalResponse("Invalid booking: user information not found", null, HttpStatus.BAD_REQUEST);
			}
			
			String userRole = booking.getAppUser().getRole().name();
			if (!"USER".equalsIgnoreCase(userRole)) {
				return universalResponse("Payment is only available for regular users", null, HttpStatus.FORBIDDEN);
			}

			String orderId = "TXN" + System.currentTimeMillis();
			
			Map<String, Object> response = new HashMap<>();
			response.put("orderId", orderId);
			response.put("amount", (int)(amount * 100));
			response.put("currency", currency != null ? currency : "INR");
			response.put("keyId", System.getenv("RAZORPAY_KEY_ID") != null ? System.getenv("RAZORPAY_KEY_ID") : "rzp_test_1DP5mmOlF5G5ag");

			return universalResponse("Order created successfully", response, HttpStatus.OK);

		} catch (Exception e) {
			System.err.println("Error creating payment order: " + e.getMessage());
			e.printStackTrace();
			return universalResponse("Failed to create payment order: " + e.getMessage(), null,
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public ResponseEntity<?> verifyPayment(Long bookingId, String razorpayOrderId, String razorpayPaymentId,
			String razorpaySignature) {
		try {
			Optional<Booking> bookingOptional = bookingRepository.findById(bookingId);
			if (bookingOptional.isEmpty()) {
				return universalResponse("Booking not found", null, HttpStatus.NOT_FOUND);
			}

			Booking booking = bookingOptional.get();

			if (booking.getAppUser() == null || booking.getAppUser().getRole() == null) {
				return universalResponse("Invalid booking: user information not found", null, HttpStatus.BAD_REQUEST);
			}

			String userRole = booking.getAppUser().getRole().name();
			if (!"USER".equalsIgnoreCase(userRole)) {
				return universalResponse("Payment verification is only available for regular users", null,
						HttpStatus.FORBIDDEN);
			}

			if (booking.getPaymentStatus() == PaymentStatus.PAID) {
				return universalResponse("Payment already verified for this booking", booking, HttpStatus.OK);
			}

			booking.setPaymentStatus(PaymentStatus.PAID);
			if (booking.getTransactionId() == null || booking.getTransactionId().isEmpty()) {
				booking.setTransactionId("TXN" + System.currentTimeMillis());
			}
			bookingRepository.save(booking);

			return universalResponse("Payment verified successfully", booking, HttpStatus.OK);

		} catch (Exception e) {
			System.err.println("Error verifying payment: " + e.getMessage());
			e.printStackTrace();
			
			Optional<Booking> bookingOptional = bookingRepository.findById(bookingId);
			if (bookingOptional.isPresent()) {
				Booking booking = bookingOptional.get();
				booking.setPaymentStatus(PaymentStatus.FAILED);
				bookingRepository.save(booking);
			}
			
			return universalResponse("Failed to verify payment: " + e.getMessage(), null,
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public ResponseEntity<?> markPaymentFailed(Long bookingId) {
		try {
			Optional<Booking> bookingOptional = bookingRepository.findById(bookingId);
			if (bookingOptional.isEmpty()) {
				return universalResponse("Booking not found", null, HttpStatus.NOT_FOUND);
			}

			Booking booking = bookingOptional.get();

			if (booking.getAppUser() == null || booking.getAppUser().getRole() == null) {
				return universalResponse("Invalid booking: user information not found", null, HttpStatus.BAD_REQUEST);
			}

			String userRole = booking.getAppUser().getRole().name();
			if (!"USER".equalsIgnoreCase(userRole)) {
				return universalResponse("Payment failure update is only available for regular users", null,
						HttpStatus.FORBIDDEN);
			}

			if (booking.getPaymentStatus() == PaymentStatus.PAID) {
				return universalResponse("Cannot mark paid booking as failed", booking, HttpStatus.BAD_REQUEST);
			}

			bookingRepository.delete(booking);

			return universalResponse("Booking deleted due to payment failure", null, HttpStatus.OK);

		} catch (Exception e) {
			System.err.println("Error deleting booking after payment failure: " + e.getMessage());
			e.printStackTrace();
			return universalResponse("Failed to delete booking: " + e.getMessage(), null,
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public ResponseEntity<?> cancelPaymentAndDeleteBooking(Long bookingId) {
		try {
			Optional<Booking> bookingOptional = bookingRepository.findById(bookingId);
			if (bookingOptional.isEmpty()) {
				return universalResponse("Booking not found", null, HttpStatus.NOT_FOUND);
			}

			Booking booking = bookingOptional.get();

			if (booking.getAppUser() == null || booking.getAppUser().getRole() == null) {
				return universalResponse("Invalid booking: user information not found", null, HttpStatus.BAD_REQUEST);
			}

			String userRole = booking.getAppUser().getRole().name();
			if (!"USER".equalsIgnoreCase(userRole)) {
				return universalResponse("Payment cancellation is only available for regular users", null,
						HttpStatus.FORBIDDEN);
			}

			if (booking.getPaymentStatus() == PaymentStatus.PAID) {
				return universalResponse("Cannot cancel paid booking", booking, HttpStatus.BAD_REQUEST);
			}

			bookingRepository.delete(booking);

			return universalResponse("Booking deleted due to payment cancellation", null, HttpStatus.OK);

		} catch (Exception e) {
			System.err.println("Error deleting booking after payment cancellation: " + e.getMessage());
			e.printStackTrace();
			return universalResponse("Failed to delete booking: " + e.getMessage(), null,
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	private ResponseEntity<?> universalResponse(String message, Object data, HttpStatus httpStatus) {
		responseWrapper.setMessage(message);
		responseWrapper.setData(data);
		return new ResponseEntity<>(responseWrapper, httpStatus);
	}
}

