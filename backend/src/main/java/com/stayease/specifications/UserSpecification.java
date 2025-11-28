package com.stayease.specifications;

import org.springframework.data.jpa.domain.Specification;

import com.stayease.models.AppUser;

public class UserSpecification {

	public static Specification<AppUser> searchInAllFields(String searchTerm) {
		return (root, query, cb) -> {
			if (searchTerm == null || searchTerm.isEmpty()) {
				return null;
			}
			String search = "%" + searchTerm.toLowerCase() + "%";
			return cb.or(
					cb.like(cb.lower(root.get("firstname")), search),
					cb.like(cb.lower(root.get("lastname")), search),
					cb.like(cb.lower(root.get("email")), search),
					cb.like(cb.lower(root.get("contactNumber")), search)
			);
		};
	}

}

