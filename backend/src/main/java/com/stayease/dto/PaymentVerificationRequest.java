package com.stayease.dto;

import lombok.Data;

@Data
public class PaymentVerificationRequest {
    private Long bookingId;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
}

