package com.stayease.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class BookingRequest {
	private long roomId;
    private long userId;
    private int totalGuests;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
}

