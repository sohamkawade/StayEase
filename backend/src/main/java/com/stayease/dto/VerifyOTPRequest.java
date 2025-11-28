package com.stayease.dto;

import lombok.Data;

@Data
public class VerifyOTPRequest {
    private String email;
    private String otp;
}

