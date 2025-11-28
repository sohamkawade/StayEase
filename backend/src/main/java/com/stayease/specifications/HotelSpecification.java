package com.stayease.specifications;

import org.springframework.data.jpa.domain.Specification;

import com.stayease.models.Hotel;

import jakarta.persistence.criteria.Join;

public class HotelSpecification {

	public static Specification<Hotel> searchInAllFields(String searchTerm) {
		return (root, query, cb) -> {
			if (searchTerm == null || searchTerm.isEmpty()) {
				return null;
			}
			String search = "%" + searchTerm.toLowerCase() + "%";
			Join<Hotel, com.stayease.models.Address> addressJoin = root.join("address");
			return cb.or(
					cb.like(cb.lower(root.get("hotelName")), search),
					cb.like(cb.lower(root.get("description")), search),
					cb.like(cb.lower(addressJoin.get("city")), search),
					cb.like(cb.lower(addressJoin.get("state")), search)
			);
		};
	}

	public static Specification<Hotel> hasStatus(String status) {
		return (root, query, cb) -> {
			if (status == null || status.isEmpty() || status.equalsIgnoreCase("all")) {
				return null;
			} else {
				return cb.equal(cb.lower(root.get("status")), status.toLowerCase());
			}
		};
	}

	public static Specification<Hotel> sortByHotelName(String sortDirection) {
		return (root, query, cb) -> {
			if (sortDirection == null) {
				return null;
			}
			if (sortDirection.equalsIgnoreCase("asc")) {
				query.orderBy(cb.asc(root.get("hotelName")));
			} else {
				query.orderBy(cb.desc(root.get("hotelName")));
			}
			return null;
		};
	}

}

