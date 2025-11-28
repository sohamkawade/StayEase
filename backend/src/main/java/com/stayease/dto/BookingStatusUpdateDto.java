package com.stayease.dto;

import com.stayease.enums.BookingStatus;
import lombok.Data;

@Data
public class BookingStatusUpdateDto {
	private BookingStatus bookingStatus;
}

