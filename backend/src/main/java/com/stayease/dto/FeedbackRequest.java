package com.stayease.dto;

import lombok.Data;

@Data
public class FeedbackRequest {
    private Long userId;
    private Long hotelId;
    private Integer rating;
    private String comment;
}

