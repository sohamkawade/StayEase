package com.stayease.dto;

import lombok.Data;

@Data
public class EmailRequest {
	private String toEmail;
	private String guestName;
	private String emailType;
	private String subject;
	private String body;
}

