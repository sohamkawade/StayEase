package com.stayease.services;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.stayease.MyResponseWrapper;
import com.stayease.models.AppUser;
import com.stayease.models.StayEaseFeedback;
import com.stayease.repositories.AppUserRepository;
import com.stayease.repositories.StayEaseFeedbackRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StayEaseFeedbackService {

    private final MyResponseWrapper responseWrapper;
    private final StayEaseFeedbackRepository stayEaseFeedbackRepository;
    private final AppUserRepository appUserRepository;

    private ResponseEntity<?> universalResponse(String message, Object data, HttpStatus httpStatus) {
        responseWrapper.setMessage(message);
        responseWrapper.setData(data);
        return new ResponseEntity<>(responseWrapper, httpStatus);
    }

    @Transactional
    public ResponseEntity<?> submitFeedback(Long userId, int rating, String message) {
        if (rating < 1 || rating > 5) {
            return universalResponse("Rating must be between 1 and 5", null, HttpStatus.BAD_REQUEST);
        }

        Optional<AppUser> user = appUserRepository.findById(userId);
        if (user.isEmpty()) {
            return universalResponse("User not found", null, HttpStatus.NOT_FOUND);
        }

        StayEaseFeedback feedback = new StayEaseFeedback();
        feedback.setUser(user.get());
        feedback.setMessage(message);
        feedback.setRating(rating);
        feedback.setDate(LocalDate.now());

        stayEaseFeedbackRepository.save(feedback);

        return universalResponse("Thank you for your feedback!", feedback, HttpStatus.OK);
    }
    
    @Transactional
    public ResponseEntity<?> getAllFeedbacks() {
        List<StayEaseFeedback> feedbacks = stayEaseFeedbackRepository.findAll();
        if (feedbacks.isEmpty()) {
            return universalResponse("No feedbacks available yet", List.of(), HttpStatus.OK);
        }
        // Ensure user data is loaded
        for (StayEaseFeedback feedback : feedbacks) {
            if (feedback.getUser() != null) {
                org.hibernate.Hibernate.initialize(feedback.getUser());
            }
        }
        return universalResponse("All feedbacks fetched successfully", feedbacks, HttpStatus.OK);
    }
}
