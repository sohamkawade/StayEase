package com.stayease.dto;

import lombok.Data;

@Data
public class ProfileResponse {
	private Long id;

	private String firstname;
	private String lastname;
	private String contactNumber;
	private String profilePicture;

	private String email;
	private Boolean isGoogleUser;
	private String authProviderType;
}

