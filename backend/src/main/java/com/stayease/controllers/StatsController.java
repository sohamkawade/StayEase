package com.stayease.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stayease.services.StatsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return statsService.getStats();
    }
}
