package com.stayease.services;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.stayease.MyResponseWrapper;
import com.stayease.models.Hotel;
import com.stayease.dto.StatsResponse;
import com.stayease.models.StayEaseFeedback;
import com.stayease.repositories.HotelRepository;
import com.stayease.repositories.RoomRepository;
import com.stayease.repositories.StayEaseFeedbackRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final MyResponseWrapper responseWrapper;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final StayEaseFeedbackRepository stayEaseFeedbackRepository;

    private ResponseEntity<?> universalResponse(String message, Object data, HttpStatus httpStatus) {
        responseWrapper.setMessage(message);
        responseWrapper.setData(data);
        return new ResponseEntity<>(responseWrapper, httpStatus);
    }

    public ResponseEntity<?> getStats() {
        long totalHotels = hotelRepository.count();
        long totalRooms = roomRepository.count();
        
        List<StayEaseFeedback> feedbacks = stayEaseFeedbackRepository.findAll();
        Set<Long> uniqueUsers = new HashSet<>();
        for (StayEaseFeedback feedback : feedbacks) {
            if (feedback.getUser() != null && feedback.getUser().getId() != null) {
                uniqueUsers.add(feedback.getUser().getId());
            }
        }
        long happyGuests = uniqueUsers.size();
        
        List<Hotel> hotels = hotelRepository.findAll();
        Set<String> cities = new HashSet<>();
        for (Hotel hotel : hotels) {
            if (hotel.getAddress() != null && hotel.getAddress().getCity() != null) {
                String city = hotel.getAddress().getCity().trim();
                if (!city.isEmpty()) {
                    cities.add(city);
                }
            }
        }
        long totalCities = cities.size();
        
        StatsResponse stats = new StatsResponse();
        stats.setHappyGuests(happyGuests);
        stats.setTotalHotels(totalHotels);
        stats.setTotalRooms(totalRooms);
        stats.setTotalCities(totalCities);
        
        return universalResponse("Stats fetched successfully", stats, HttpStatus.OK);
    }
}

