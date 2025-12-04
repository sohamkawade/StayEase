package com.stayease.dto;

import lombok.Data;

@Data
public class PaymentOrderRequest {
    private Long bookingId;
    private Double amount;
    private String currency;
}

