package com.stayease.specifications;

import org.springframework.data.jpa.domain.Specification;

import com.stayease.models.Room;
import com.stayease.enums.RoomStatus;

public class RoomSpecification {

	public static Specification<Room> hasHotelId(Long hotelId) {
		return (root, query, cb) -> hotelId == null ? null
				: cb.equal(root.get("hotel").get("id"), hotelId);
	}

	public static Specification<Room> roomNumberContains(String roomNumber) {
		return (root, query, cb) -> roomNumber == null ? null
				: cb.like(cb.lower(root.get("roomNumber")), "%" + roomNumber.toLowerCase() + "%");
	}

	public static Specification<Room> hasStatusString(String status) {
		return (root, query, cb) -> {
			if (status == null || status.isEmpty()) {
				return null;
			}
			try {
				RoomStatus roomStatus = RoomStatus.valueOf(status.toUpperCase());
				return cb.equal(root.get("status"), roomStatus);
			} catch (IllegalArgumentException e) {
				return null;
			}
		};
	}

	public static Specification<Room> hasRoomType(String roomType) {
		return (root, query, cb) -> {
			if (roomType == null || roomType.isEmpty()) {
				return null;
			}
			return cb.equal(cb.lower(root.get("roomType")), roomType.toLowerCase());
		};
	}

	public static Specification<Room> priceBetween(Double minPrice, Double maxPrice) {
		return (root, query, cb) -> {
			if (minPrice == null && maxPrice == null) {
				return null;
			} else if (minPrice != null && maxPrice != null) {
				return cb.between(root.get("price"), minPrice, maxPrice);
			} else if (minPrice != null) {
				return cb.greaterThanOrEqualTo(root.get("price"), minPrice);
			} else {
				return cb.lessThanOrEqualTo(root.get("price"), maxPrice);
			}
		};
	}

	public static Specification<Room> sortByPrice(String sortDirection) {
		return (root, query, cb) -> {
			if (sortDirection == null) {
				return null;
			}
			if (sortDirection.equalsIgnoreCase("asc")) {
				query.orderBy(cb.asc(root.get("price")));
			} else {
				query.orderBy(cb.desc(root.get("price")));
			}
			return null;
		};
	}
}

