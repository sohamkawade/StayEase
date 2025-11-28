package com.stayease.specifications;

import java.time.LocalDate;

import org.springframework.data.jpa.domain.Specification;

import com.stayease.models.Booking;
import com.stayease.enums.BookingStatus;
import com.stayease.enums.PaymentStatus;

import jakarta.persistence.criteria.Join;

public class BookingSpecification {

	public static Specification<Booking> hasBookingStatusString(String status) {
		return (root, query, cb) -> {
			if (status == null || status.isEmpty()) {
				return null;
			}
			try {
				BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
				return cb.equal(root.get("bookingStatus"), bookingStatus);
			} catch (IllegalArgumentException e) {
				return null;
			}
		};
	}

	public static Specification<Booking> hasPaymentStatusString(String status) {
		return (root, query, cb) -> {
			if (status == null || status.isEmpty()) {
				return null;
			}
			try {
				PaymentStatus paymentStatus = PaymentStatus.valueOf(status.toUpperCase());
				return cb.equal(root.get("paymentStatus"), paymentStatus);
			} catch (IllegalArgumentException e) {
				return null;
			}
		};
	}

	public static Specification<Booking> hasHotelId(Long hotelId) {
		return (root, query, cb) -> hotelId == null ? null
				: cb.equal(root.get("hotel").get("id"), hotelId);
	}

	public static Specification<Booking> hasUserId(Long userId) {
		return (root, query, cb) -> userId == null ? null
				: cb.equal(root.get("appUser").get("id"), userId);
	}

	public static Specification<Booking> searchInAllFields(String searchTerm) {
		return (root, query, cb) -> {
			if (searchTerm == null || searchTerm.isEmpty()) {
				return null;
			}
			String search = "%" + searchTerm.toLowerCase() + "%";
			Join<Booking, com.stayease.models.Hotel> hotelJoin = root.join("hotel");
			Join<com.stayease.models.Hotel, com.stayease.models.Address> addressJoin = hotelJoin.join("address");
			Join<Booking, com.stayease.models.AppUser> userJoin = root.join("appUser");
			return cb.or(
					cb.like(cb.lower(hotelJoin.get("hotelName")), search),
					cb.like(cb.lower(addressJoin.get("city")), search),
					cb.like(cb.lower(root.get("transactionId")), search),
					cb.like(cb.lower(userJoin.get("firstname")), search),
					cb.like(cb.lower(userJoin.get("lastname")), search),
					cb.like(cb.lower(userJoin.get("email")), search)
			);
		};
	}

	public static Specification<Booking> checkInDateBetween(LocalDate startDate, LocalDate endDate) {
		return (root, query, cb) -> {
			if (startDate == null && endDate == null) {
				return null;
			} else if (startDate != null && endDate != null) {
				return cb.between(root.get("checkInDate"), startDate, endDate);
			} else if (startDate != null) {
				return cb.greaterThanOrEqualTo(root.get("checkInDate"), startDate);
			} else {
				return cb.lessThanOrEqualTo(root.get("checkInDate"), endDate);
			}
		};
	}

	public static Specification<Booking> sortByCheckInDate(String sortDirection) {
		return (root, query, cb) -> {
			if (sortDirection == null) {
				return null;
			}
			if (sortDirection.equalsIgnoreCase("asc")) {
				query.orderBy(cb.asc(root.get("checkInDate")));
			} else {
				query.orderBy(cb.desc(root.get("checkInDate")));
			}
			return null;
		};
	}
}

