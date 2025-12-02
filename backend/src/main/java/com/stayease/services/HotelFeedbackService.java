package com.stayease.services;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stayease.MyResponseWrapper;
import com.stayease.models.AppUser;
import com.stayease.models.Hotel;
import com.stayease.models.HotelFeedback;
import com.stayease.repositories.AppUserRepository;
import com.stayease.repositories.HotelFeedbackRepository;
import com.stayease.repositories.HotelRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HotelFeedbackService {

    private final HotelFeedbackRepository feedbackRepository;
    private final HotelRepository hotelRepository;
    private final AppUserRepository appUserRepository;

    private ResponseEntity<?> universalResponse(String message, Object data, HttpStatus status) {
        MyResponseWrapper response = new MyResponseWrapper();
        response.setMessage(message);
        response.setData(data);
        return new ResponseEntity<>(response, status);
    }

    @Transactional
    public ResponseEntity<?> submitFeedback(Long userId, Long hotelId, Integer rating, String comment) {
        if (rating == null || rating < 1 || rating > 5) {
            return universalResponse("Rating must be between 1 and 5", null, HttpStatus.BAD_REQUEST);
        }

        Optional<AppUser> user = appUserRepository.findById(userId);
        if (user.isEmpty()) {
            return universalResponse("User not found", null, HttpStatus.NOT_FOUND);
        }

        Optional<Hotel> hotel = hotelRepository.findById(hotelId);
        if (hotel.isEmpty()) {
            return universalResponse("Hotel not found", null, HttpStatus.NOT_FOUND);
        }

        HotelFeedback feedback = new HotelFeedback();
        feedback.setUser(user.get());
        feedback.setHotel(hotel.get());
        feedback.setRating(rating);
        feedback.setComment(comment);
        feedback.setDate(LocalDate.now());
        feedbackRepository.save(feedback);
        updateHotelRating(hotelId);

        return universalResponse("Feedback submitted successfully", feedback, HttpStatus.OK);
    }

    @Transactional
    private void updateHotelRating(Long hotelId) {
        List<HotelFeedback> feedbacks = feedbackRepository.findByHotelId(hotelId);
        if (feedbacks.isEmpty()) return;

        double sum = feedbacks.stream().mapToInt(HotelFeedback::getRating).sum();
        double average = sum / feedbacks.size();

        Optional<Hotel> hotelOpt = hotelRepository.findById(hotelId);
        if (hotelOpt.isPresent()) {
            hotelOpt.get().setStarRating(average);
            hotelRepository.save(hotelOpt.get());
        }
    }

    public ResponseEntity<?> getFeedbackByHotelId(Long hotelId) {
        List<HotelFeedback> feedbacks = feedbackRepository.findByHotelId(hotelId);
        return universalResponse("Feedbacks fetched successfully", feedbacks, HttpStatus.OK);
    }

    public ResponseEntity<?> getFeedbackByUserId(Long userId) {
        List<HotelFeedback> feedbacks = feedbackRepository.findByUserId(userId);
        return universalResponse("Feedbacks fetched successfully", feedbacks, HttpStatus.OK);
    }

    @Transactional
    public ResponseEntity<?> deleteFeedback(Long id) {
        Optional<HotelFeedback> existingFeedback = feedbackRepository.findById(id);
        if (existingFeedback.isPresent()) {
            HotelFeedback feedback = existingFeedback.get();
            Long hotelId = feedback.getHotel().getId();
            feedbackRepository.delete(feedback);
            // Update hotel rating after deletion
            updateHotelRating(hotelId);
            return universalResponse("Feedback deleted successfully", null, HttpStatus.OK);
        } else {
            return universalResponse("There is no feedback with id: " + id, null, HttpStatus.NOT_FOUND);
        }
    }
}

