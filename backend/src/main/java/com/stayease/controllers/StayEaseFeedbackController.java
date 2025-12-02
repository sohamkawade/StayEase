package com.stayease.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.stayease.services.StayEaseFeedbackService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class StayEaseFeedbackController {

	private final StayEaseFeedbackService easeFeedbackService;

    @PostMapping("/submit/{userId}")
    public ResponseEntity<?> submitFeedback(
            @PathVariable Long userId,
            @RequestParam int rating,
            @RequestParam String message) {
        return easeFeedbackService.submitFeedback(userId, rating, message);
    }

    @GetMapping("/feedbacks")
    public ResponseEntity<?> getAllFeedbacks() {
        return easeFeedbackService.getAllFeedbacks();
    }

    @DeleteMapping("/stayease-feedback/{id}")
    public ResponseEntity<?> deleteFeedback(@PathVariable Long id) {
        return easeFeedbackService.deleteFeedback(id);
    }
}
