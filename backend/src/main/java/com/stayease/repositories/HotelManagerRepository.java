package com.stayease.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.stayease.models.HotelManager;

@Repository
public interface HotelManagerRepository extends JpaRepository<HotelManager, Long> {
	Optional<HotelManager> findManagerByEmail(String email);
}
