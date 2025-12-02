package com.stayease.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stayease.dto.FeedbackRequest;
import com.stayease.services.HotelFeedbackService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class HotelFeedbackController {

    private final HotelFeedbackService feedbackService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitFeedback(@RequestBody FeedbackRequest request) {
        return feedbackService.submitFeedback(
            request.getUserId(),
            request.getHotelId(),
            request.getRating(),
            request.getComment()
        );
    }

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<?> getFeedbackByHotelId(@PathVariable Long hotelId) {
        return feedbackService.getFeedbackByHotelId(hotelId);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getFeedbackByUserId(@PathVariable Long userId) {
        return feedbackService.getFeedbackByUserId(userId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFeedback(@PathVariable Long id) {
        return feedbackService.deleteFeedback(id);
    }

}

