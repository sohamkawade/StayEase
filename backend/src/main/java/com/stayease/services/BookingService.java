package com.stayease.services;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stayease.MyResponseWrapper;
import com.stayease.models.AppUser;
import com.stayease.models.Booking;
import com.stayease.enums.BookingStatus;
import com.stayease.dto.BookingStatusUpdateDto;
import com.stayease.models.Hotel;
import com.stayease.enums.PaymentStatus;
import com.stayease.models.Room;
import com.stayease.enums.RoomStatus;
import com.stayease.repositories.AppUserRepository;
import com.stayease.repositories.BookingRepository;
import com.stayease.repositories.HotelRepository;
import com.stayease.repositories.RoomRepository;
import com.stayease.specifications.BookingSpecification;
import org.springframework.data.jpa.domain.Specification;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingService {

	private final HotelRepository hotelRepository;
	private final RoomRepository roomRepository;
	private final BookingRepository bookingRepository;
	private final MyResponseWrapper responseWrapper;
	private final AppUserRepository appUserRepository;
	private final WhatsAppService whatsAppService;
	private final EmailService emailService;
	
	@Value("${app.booking.cancellation.allowed-hours-before-checkin:1}")
	private int cancellationHoursBeforeCheckin;

	public ResponseEntity<?> bookRoom(long roomId, long userId, int totalGuests, LocalDate checkInDate,
			LocalDate checkOutDate) {
		Optional<AppUser> existingUser = appUserRepository.findById(userId);
		if (existingUser.isPresent()) {
			Optional<Room> room = roomRepository.findById(roomId);
			if (room.isEmpty()) {
				return universalResponse("Room not found with id: " + roomId, null, HttpStatus.NOT_FOUND);
			}
			Room bookRoom = room.get();
			Booking booking = new Booking();
			booking.setAppUser(existingUser.get());
			booking.setRoom(bookRoom);
			booking.setHotel(bookRoom.getHotel());
			booking.setBookingStatus(BookingStatus.PENDING);
			booking.setPaymentStatus(PaymentStatus.PENDING);
			booking.setCheckInDate(checkInDate != null ? checkInDate : LocalDate.now());
			booking.setCheckOutDate(checkOutDate != null ? checkOutDate : LocalDate.now().plusDays(1));
			booking.setTotalGuests(totalGuests);
			booking.setTotalAmount(bookRoom.getPrice());
			booking.setTransactionId("TXN" + System.currentTimeMillis());

			Booking savedRoom = bookingRepository.save(booking);
			
			updateRoomStatusBasedOnBookings(bookRoom);
			roomRepository.save(bookRoom);
			
			return universalResponse("Room booked successfully", savedRoom, HttpStatus.OK);
		} else {
			return universalResponse("User Not Found with id:" + userId, null, HttpStatus.NOT_FOUND);
		}
	}

	public ResponseEntity<?> getAllBookings(){
		List<Booking> allBookings =  bookingRepository.findAll();
		if(allBookings.size()==0) {
			return universalResponse("There are no bookings", null, HttpStatus.NOT_FOUND);
		}
		return universalResponse("Bookings fetched successfully", allBookings, HttpStatus.OK);
	}

	public ResponseEntity<?> getFilteredBookings(String search, String bookingStatus, String paymentStatus, Long hotelId,
			Long userId, LocalDate checkInStart, LocalDate checkInEnd, String sortBy, String sortDirection) {
		Specification<Booking> allFilters = null;
		
		if (search != null && !search.isEmpty()) {
			Specification<Booking> searchSpec = BookingSpecification.searchInAllFields(search);
			allFilters = searchSpec;
		}
		
		Specification<Booking> bookingStatusSpec = BookingSpecification.hasBookingStatusString(bookingStatus);
		if (bookingStatusSpec != null) {
			allFilters = allFilters == null ? bookingStatusSpec : allFilters.and(bookingStatusSpec);
		}
		
		Specification<Booking> paymentStatusSpec = BookingSpecification.hasPaymentStatusString(paymentStatus);
		if (paymentStatusSpec != null) {
			allFilters = allFilters == null ? paymentStatusSpec : allFilters.and(paymentStatusSpec);
		}
		
		Specification<Booking> hotelIdSpec = BookingSpecification.hasHotelId(hotelId);
		if (hotelIdSpec != null) {
			allFilters = allFilters == null ? hotelIdSpec : allFilters.and(hotelIdSpec);
		}
		
		Specification<Booking> userIdSpec = BookingSpecification.hasUserId(userId);
		if (userIdSpec != null) {
			allFilters = allFilters == null ? userIdSpec : allFilters.and(userIdSpec);
		}
		
		Specification<Booking> dateRangeSpec = BookingSpecification.checkInDateBetween(checkInStart, checkInEnd);
		if (dateRangeSpec != null) {
			allFilters = allFilters == null ? dateRangeSpec : allFilters.and(dateRangeSpec);
		}

		if (sortBy != null && sortDirection != null
				&& ("checkindate".equalsIgnoreCase(sortBy) || "checkin".equalsIgnoreCase(sortBy))) {
			Specification<Booking> sortSpec = BookingSpecification.sortByCheckInDate(sortDirection);
			allFilters = allFilters == null ? sortSpec : allFilters.and(sortSpec);
		}

		List<Booking> filteredBookings = allFilters == null ? bookingRepository.findAll() : bookingRepository.findAll(allFilters);
		return universalResponse("Following filtered bookings found", filteredBookings, HttpStatus.OK);
	}

	@Transactional
	public ResponseEntity<?> getUserBookings(long userId, String search, String bookingStatus) {
		Specification<Booking> allFilters = null;
		
		Specification<Booking> userIdSpec = BookingSpecification.hasUserId(userId);
		allFilters = userIdSpec;
		
		if (search != null && !search.isEmpty()) {
			Specification<Booking> searchSpec = BookingSpecification.searchInAllFields(search);
			allFilters = allFilters.and(searchSpec);
		}
		
		Specification<Booking> statusSpec = BookingSpecification.hasBookingStatusString(bookingStatus);
		if (statusSpec != null) {
			allFilters = allFilters.and(statusSpec);
		}
		
		Specification<Booking> sortSpec = BookingSpecification.sortByCheckInDate("desc");
		allFilters = allFilters.and(sortSpec);

		List<Booking> bookings = bookingRepository.findAll(allFilters);
		return universalResponse("Bookings fetched successfully", bookings, HttpStatus.OK);
	}

	@Transactional
	public ResponseEntity<?> getUserPaymentTransactions(long userId) {
		Specification<Booking> userIdSpec = BookingSpecification.hasUserId(userId);
		Specification<Booking> sortSpec = BookingSpecification.sortByCheckInDate("desc");
		Specification<Booking> allFilters = userIdSpec.and(sortSpec);

		List<Booking> bookings = bookingRepository.findAll(allFilters);
		
		List<Map<String, Object>> transactions = bookings.stream()
			.filter(booking -> booking.getPaymentStatus() != null)
			.map(booking -> {
				Map<String, Object> transaction = new HashMap<>();
				transaction.put("id", booking.getId());
				transaction.put("transactionId", booking.getTransactionId());
				transaction.put("amount", booking.getTotalAmount());
				transaction.put("paymentStatus", booking.getPaymentStatus().name());
				transaction.put("bookingStatus", booking.getBookingStatus().name());
				transaction.put("date", booking.getCreatedAt());
				transaction.put("checkInDate", booking.getCheckInDate());
				transaction.put("checkOutDate", booking.getCheckOutDate());
				transaction.put("totalGuests", booking.getTotalGuests());
				transaction.put("hotelName", booking.getHotel() != null ? booking.getHotel().getHotelName() : "N/A");
				transaction.put("roomType", booking.getRoom() != null ? booking.getRoom().getRoomType() : "N/A");
				transaction.put("roomNumber", booking.getRoom() != null ? booking.getRoom().getRoomNumber() : "N/A");
				return transaction;
			})
			.collect(java.util.stream.Collectors.toList());
		
		return universalResponse("Payment transactions fetched successfully", transactions, HttpStatus.OK);
	}

	@Transactional
	public ResponseEntity<?> getAllBookingsByHotelId(long hotelId, String search) {
		Optional<Hotel> existingHotel = hotelRepository.findById(hotelId);
		if (existingHotel.isEmpty()) {
			return universalResponse("Hotel not found with ID: " + hotelId, null, HttpStatus.NOT_FOUND);
		}
		
		Specification<Booking> allFilters = BookingSpecification.hasHotelId(hotelId);
		
		if (search != null && !search.isEmpty()) {
			Specification<Booking> searchSpec = BookingSpecification.searchInAllFields(search);
			allFilters = allFilters.and(searchSpec);
		}
		
		List<Booking> bookings = bookingRepository.findAll(allFilters);
		
		// Debug logging
		System.out.println("DEBUG: getAllBookingsByHotelId - HotelId: " + hotelId);
		System.out.println("DEBUG: getAllBookingsByHotelId - Total bookings found: " + bookings.size());
		for (Booking b : bookings) {
			System.out.println("DEBUG: Booking ID: " + b.getId() + ", Status: " + b.getBookingStatus() + ", Payment: " + b.getPaymentStatus() + ", HotelId: " + (b.getHotel() != null ? b.getHotel().getId() : "null"));
		}
		
		if (bookings.isEmpty()) {
			return universalResponse("No bookings found for this hotel.", new java.util.ArrayList<>(), HttpStatus.OK);
		}

		for (Booking booking : bookings) {
			if (booking.getAppUser() != null && booking.getAppUser().getUser() != null) {
				org.hibernate.Hibernate.initialize(booking.getAppUser().getUser());
			}
		}

		return universalResponse("Bookings found", bookings, HttpStatus.OK);
	}

	public ResponseEntity<?> updateBookingStatus(long bookingId, BookingStatusUpdateDto bookingStatusUpdateDto) {
		Optional<Booking> existingBooking = bookingRepository.findById(bookingId);
		if (existingBooking.isPresent()) {
			Booking booking = existingBooking.get();
			BookingStatus oldStatus = booking.getBookingStatus();
			BookingStatus newStatus = bookingStatusUpdateDto.getBookingStatus();
			
			if (newStatus == BookingStatus.CHECKED_OUT) {
				booking.setBookingStatus(BookingStatus.COMPLETED);
			} else {
				booking.setBookingStatus(newStatus);
			}
			
			if (newStatus == BookingStatus.CANCELLED && booking.getPaymentStatus() == PaymentStatus.PAID) {
				booking.setPaymentStatus(PaymentStatus.REFUNDED);
			}
			
			bookingRepository.save(booking);
			
			Room room = booking.getRoom();
			if (room != null) {
				updateRoomStatusBasedOnBookings(room);
				roomRepository.save(room);
			}
			
			if (newStatus == BookingStatus.CONFIRMED && oldStatus == BookingStatus.PENDING) {
				try {
					AppUser user = booking.getAppUser();
					Hotel hotel = booking.getHotel();
					
					if (user != null && user.getUser() != null) {
						org.hibernate.Hibernate.initialize(user.getUser());
					}
					
					if (hotel != null && hotel.getId() != null) {
						Optional<Hotel> hotelWithAddress = hotelRepository.findById(hotel.getId());
						if (hotelWithAddress.isPresent()) {
							hotel = hotelWithAddress.get();
							if (hotel.getAddress() != null) {
								hotel.getAddress().getStreetAddress();
							}
						}
					}
					
					if (room != null && room.getId() != null) {
						Optional<Room> roomOptional = roomRepository.findById(room.getId());
						if (roomOptional.isPresent()) {
							room = roomOptional.get();
						}
					}
					
					if (user != null && hotel != null && room != null) {
						whatsAppService.sendBookingConfirmation(booking, user, hotel, room);
						
						if (user.getUser() != null && user.getUser().getEmail() != null && !user.getUser().getEmail().isEmpty()) {
							String guestName = user.getFirstname() + " " + user.getLastname();
							String checkInDate = booking.getCheckInDate().format(java.time.format.DateTimeFormatter.ofPattern("dd-MM-yyyy"));
							String checkOutDate = booking.getCheckOutDate().format(java.time.format.DateTimeFormatter.ofPattern("dd-MM-yyyy"));
							
							emailService.sendBookingConfirmationEmail(
								user.getUser().getEmail(),
								guestName,
								hotel.getHotelName(),
								room.getRoomNumber(),
								room.getRoomType(),
								checkInDate,
								checkOutDate,
								booking.getTransactionId(),
								booking.getTotalAmount(),
								booking.getTotalGuests()
							);
						}
					}
				} catch (Exception e) {
					System.err.println("Failed to send confirmation message: " + e.getMessage());
					e.printStackTrace();
				}
			}
			
			return universalResponse("Booking status updated successfully.", booking, HttpStatus.OK);
		} else {
			return universalResponse("Bookings not found with id:" + bookingId, null, HttpStatus.NOT_FOUND);
		}
	}
	
	private void updateRoomStatusBasedOnBookings(Room room) {
		List<Booking> bookings = bookingRepository.findByRoomId(room.getId());
		if (bookings == null || bookings.isEmpty()) {
			room.setStatus(RoomStatus.AVAILABLE);
			return;
		}
		for (Booking booking : bookings) {
			BookingStatus status = booking.getBookingStatus();
			if (status == BookingStatus.PENDING || 
			    status == BookingStatus.CONFIRMED || 
			    status == BookingStatus.CHECKED_IN || 
			    status == BookingStatus.CHECKED_OUT) {
				room.setStatus(RoomStatus.BOOKED);
				return;
			}
		}
				boolean allInactive = true;
		for (Booking booking : bookings) {
			BookingStatus status = booking.getBookingStatus();
			if (status != BookingStatus.COMPLETED && status != BookingStatus.CANCELLED) {
				allInactive = false;
				break;
			}
		}
		
		if (allInactive) {
			room.setStatus(RoomStatus.AVAILABLE);
		}
	}

	public ResponseEntity<?> getGuestListByHotel(long hotelId) {
		List<AppUser> guests = bookingRepository.findDistinctGuestsByHotelId(hotelId);
		if (guests.size() == 0) {
			return universalResponse("No guests have booked rooms in this hotel.", null, HttpStatus.NOT_FOUND);
		} else {
			return universalResponse("Following guests have booked rooms in this hotel.", guests, HttpStatus.FOUND);
		}
	}
	
	public ResponseEntity<?> sendEmailToGuest(String toEmail, String guestName, String emailType, String subject, String body) {
		try {
			emailService.sendEmailToGuest(toEmail, guestName, subject, body);
			return universalResponse("Email sent successfully to " + guestName, null, HttpStatus.OK);
		} catch (Exception e) {
			String errorMessage = e.getMessage();
			if (e.getCause() != null && e.getCause().getMessage() != null) {
				errorMessage = e.getCause().getMessage();
			}
			System.err.println("Error in sendEmailToGuest: " + errorMessage);
			e.printStackTrace();
			return universalResponse("Failed to send email: " + errorMessage, null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	@Transactional
	public ResponseEntity<?> cancelBookingByUser(long bookingId, long userId) {
		Optional<Booking> existingBooking = bookingRepository.findById(bookingId);
		if (existingBooking.isEmpty()) {
			return universalResponse("Booking not found", null, HttpStatus.NOT_FOUND);
		}
		
		Booking booking = existingBooking.get();
		
		if (booking.getAppUser() == null || booking.getAppUser().getId() == null || 
		    booking.getAppUser().getId() != userId) {
			return universalResponse("You are not authorized to cancel this booking", null, HttpStatus.FORBIDDEN);
		}
		
		BookingStatus currentStatus = booking.getBookingStatus();
		if (currentStatus == BookingStatus.CANCELLED) {
			return universalResponse("Booking is already cancelled", null, HttpStatus.BAD_REQUEST);
		}
		
		if (currentStatus == BookingStatus.CHECKED_IN || currentStatus == BookingStatus.CHECKED_OUT || 
		    currentStatus == BookingStatus.COMPLETED) {
			return universalResponse("Cannot cancel booking after check-in", null, HttpStatus.BAD_REQUEST);
		}
		
		LocalDate checkInDate = booking.getCheckInDate();
		if (checkInDate == null) {
			return universalResponse("Invalid booking: check-in date not found", null, HttpStatus.BAD_REQUEST);
		}
		
		java.time.LocalDateTime checkInDateTime = checkInDate.atTime(14, 0);
		java.time.LocalDateTime now = java.time.LocalDateTime.now();
		java.time.Duration duration = java.time.Duration.between(now, checkInDateTime);
		long hoursUntilCheckIn = duration.toHours();
		
		if (hoursUntilCheckIn < cancellationHoursBeforeCheckin) {
			return universalResponse("Cancellation is only allowed " + cancellationHoursBeforeCheckin + 
				" hours before check-in. Current time remaining: " + hoursUntilCheckIn + " hours", 
				null, HttpStatus.BAD_REQUEST);
		}
		
		booking.setBookingStatus(BookingStatus.CANCELLED);
		if (booking.getPaymentStatus() == PaymentStatus.PAID) {
			booking.setPaymentStatus(PaymentStatus.REFUNDED);
		}
		Booking savedBooking = bookingRepository.save(booking);
		
		Room room = booking.getRoom();
		if (room != null) {
			updateRoomStatusBasedOnBookings(room);
			roomRepository.save(room);
		}
		
		try {
			AppUser user = booking.getAppUser();
			Hotel hotel = booking.getHotel();
			
			if (user != null && user.getUser() != null && user.getUser().getEmail() != null && 
			    !user.getUser().getEmail().isEmpty() && hotel != null) {
				org.hibernate.Hibernate.initialize(user.getUser());
				
				String guestName = user.getFirstname() + " " + user.getLastname();
				String checkInDateStr = booking.getCheckInDate().format(java.time.format.DateTimeFormatter.ofPattern("dd-MM-yyyy"));
				String checkOutDateStr = booking.getCheckOutDate() != null ? 
					booking.getCheckOutDate().format(java.time.format.DateTimeFormatter.ofPattern("dd-MM-yyyy")) : "";
				
				emailService.sendBookingCancellationEmail(
					user.getUser().getEmail(),
					guestName,
					hotel.getHotelName(),
					booking.getTransactionId(),
					checkInDateStr,
					checkOutDateStr,
					booking.getTotalAmount()
				);
			}
		} catch (Exception e) {
			System.err.println("Failed to send cancellation email: " + e.getMessage());
		}
		
		return universalResponse("Booking cancelled successfully", savedBooking, HttpStatus.OK);
	}

	public ResponseEntity<?> getUserTransactions(Long userId) {
		try {
			Specification<Booking> userIdSpec = BookingSpecification.hasUserId(userId);
			List<Booking> bookings = bookingRepository.findAll(userIdSpec);
			
			List<Map<String, Object>> transactions = new java.util.ArrayList<>();
			for (Booking booking : bookings) {
				Map<String, Object> transaction = new HashMap<>();
				transaction.put("id", booking.getId());
				transaction.put("transactionId", booking.getTransactionId());
				transaction.put("amount", booking.getTotalAmount());
				transaction.put("paymentStatus", booking.getPaymentStatus());
				transaction.put("bookingStatus", booking.getBookingStatus());
				transaction.put("date", booking.getCreatedAt());
				transaction.put("checkInDate", booking.getCheckInDate());
				transaction.put("checkOutDate", booking.getCheckOutDate());
				transaction.put("hotelName", booking.getHotel() != null ? booking.getHotel().getHotelName() : "N/A");
				transaction.put("roomType", booking.getRoom() != null ? booking.getRoom().getRoomType() : "N/A");
				transaction.put("roomNumber", booking.getRoom() != null ? booking.getRoom().getRoomNumber() : "N/A");
				transaction.put("totalGuests", booking.getTotalGuests());
				transactions.add(transaction);
			}
			
			transactions.sort((a, b) -> {
				Instant dateA = (Instant) a.get("date");
				Instant dateB = (Instant) b.get("date");
				if (dateA == null && dateB == null) return 0;
				if (dateA == null) return 1;
				if (dateB == null) return -1;
				return dateB.compareTo(dateA);
			});
			
			return universalResponse("Transactions fetched successfully", transactions, HttpStatus.OK);
		} catch (Exception e) {
			System.err.println("Error fetching transactions: " + e.getMessage());
			e.printStackTrace();
			return universalResponse("Failed to fetch transactions: " + e.getMessage(), null,
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public ResponseEntity<?> deleteBooking(long bookingId) {
		Optional<Booking> existingBooking = bookingRepository.findById(bookingId);
		if (existingBooking.isPresent()) {
			Booking booking = existingBooking.get();
			Room room = booking.getRoom();
			Long roomId = room != null ? room.getId() : null;
			
			bookingRepository.delete(booking);
			
			if (roomId != null) {
				Optional<Room> roomOptional = roomRepository.findById(roomId);
				if (roomOptional.isPresent()) {
					Room roomToUpdate = roomOptional.get();
					updateRoomStatusBasedOnBookings(roomToUpdate);
					roomRepository.save(roomToUpdate);
				}
			}
			
			return universalResponse("Booking deleted successfully.", null, HttpStatus.OK);
		} else {
			return universalResponse("Booking not found with id: " + bookingId, null, HttpStatus.NOT_FOUND);
		}
	}

	private ResponseEntity<?> universalResponse(String message, Object data, HttpStatus httpStatus) {
		responseWrapper.setMessage(message);
		responseWrapper.setData(data);
		return new ResponseEntity<>(responseWrapper, httpStatus);
	}
}
