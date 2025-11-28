package com.stayease.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.stayease.models.HotelFeedback;

@Repository
public interface HotelFeedbackRepository extends JpaRepository<HotelFeedback, Long> {
    
    List<HotelFeedback> findByHotelId(Long hotelId);
    
    List<HotelFeedback> findByUserId(Long userId);
    
    Optional<HotelFeedback> findByUserIdAndHotelId(Long userId, Long hotelId);
}

