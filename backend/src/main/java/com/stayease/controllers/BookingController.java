package com.stayease.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

import com.stayease.dto.BookingRequest;
import com.stayease.dto.BookingStatusUpdateDto;
import com.stayease.dto.EmailRequest;
import com.stayease.services.BookingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BookingController {

	private final BookingService bookingService;

	@PostMapping("/bookroom")
	private ResponseEntity<?> bookRoom(@RequestBody BookingRequest bookingRequest) {
		return bookingService.bookRoom(bookingRequest.getRoomId(), bookingRequest.getUserId(),
				bookingRequest.getTotalGuests(), bookingRequest.getCheckInDate(), bookingRequest.getCheckOutDate());
	}

	@GetMapping("/bookings/user/{userId}")
	private ResponseEntity<?> getUserBookings(
			@PathVariable Long userId,
			@RequestParam(required = false) String search,
			@RequestParam(required = false) String bookingStatus
	) {
		return bookingService.getUserBookings(userId, search, bookingStatus);
	}

	@GetMapping("/bookings")
	private ResponseEntity<?> getFilteredBookings(
			@RequestParam(required = false) String search,
			@RequestParam(required = false) String bookingStatus,
			@RequestParam(required = false) String paymentStatus, @RequestParam(required = false) Long hotelId,
			@RequestParam(required = false) Long userId, @RequestParam(required = false) LocalDate checkInStart,
			@RequestParam(required = false) LocalDate checkInEnd,
			@RequestParam(required = false) String sortBy, @RequestParam(required = false) String sortDirection) {
		return bookingService.getFilteredBookings(search, bookingStatus, paymentStatus, hotelId, userId, checkInStart,
				checkInEnd, sortBy, sortDirection);
	}
	
	@GetMapping("/bookings/hotel/{hotelId}")
	private ResponseEntity<?> getAllBookingsByHotelId(
			@PathVariable long hotelId,
			@RequestParam(required = false) String search
	){
		return bookingService.getAllBookingsByHotelId(hotelId, search);
	}
	
	@PatchMapping("/bookings/{bookingId}/status")
	public ResponseEntity<?> updateBookingStatus(@PathVariable long bookingId,
	        @RequestBody BookingStatusUpdateDto bookingStatusUpdateDto) {
		return bookingService.updateBookingStatus(bookingId, bookingStatusUpdateDto);
	}
	
	@GetMapping("/guests/{hotelId}")
	private ResponseEntity<?> getGuestListByHotel(@PathVariable long hotelId) {
		return bookingService.getGuestListByHotel(hotelId);
	}
	
	@DeleteMapping("/bookings/{bookingId}")
	public ResponseEntity<?> deleteBooking(@PathVariable long bookingId) {
		return bookingService.deleteBooking(bookingId);
	}

	@PostMapping("/bookings/{bookingId}/cancel")
	public ResponseEntity<?> cancelBooking(@PathVariable long bookingId, @RequestParam long userId) {
		return bookingService.cancelBookingByUser(bookingId, userId);
	}

	@PatchMapping("/bookings/{bookingId}/cancel/user/{userId}")
	public ResponseEntity<?> cancelBookingByUser(@PathVariable long bookingId, @PathVariable long userId) {
		return bookingService.cancelBookingByUser(bookingId, userId);
	}

	@PostMapping("/guests/send-email")
	public ResponseEntity<?> sendEmailToGuest(@RequestBody EmailRequest emailRequest) {
		return bookingService.sendEmailToGuest(
			emailRequest.getToEmail(),
			emailRequest.getGuestName(),
			emailRequest.getEmailType(),
			emailRequest.getSubject(),
			emailRequest.getBody()
		);
	}

	@GetMapping("/payments/user/{userId}")
	public ResponseEntity<?> getUserPaymentTransactions(@PathVariable Long userId) {
		return bookingService.getUserPaymentTransactions(userId);
	}

}
