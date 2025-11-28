package com.stayease.dto;

import lombok.Data;

@Data
public class StatsResponse {
    private long happyGuests;
    private long totalHotels;
    private long totalRooms;
    private long totalCities;
}

