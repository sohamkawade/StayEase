package com.stayease.controllers;

import java.io.IOException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stayease.models.AppUser;
import com.stayease.services.AppUserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AppUserController {

	private final AppUserService appUserService;
	private final ObjectMapper objectMapper;
	
	@GetMapping("/user/{userId}")
	public ResponseEntity<?> getUserById(@PathVariable long userId){
		return appUserService.getUserById(userId);
	}
	
	@GetMapping("/users")
	public ResponseEntity<?> getFilteredUsers(
			@RequestParam(required = false) String search
	){
		return appUserService.getFilteredUsers(search);
	}
	
	@PatchMapping("/auth/user/{userId}")
	public ResponseEntity<?> updateUser(
	        @RequestPart("user") String userJson,
	        @RequestPart(value = "profilePicture", required = false) MultipartFile profilePicture,
	        @PathVariable long userId) throws IOException {
	    AppUser user = objectMapper.readValue(userJson, AppUser.class);
	    return appUserService.updateUser(user, profilePicture, userId);
	}
	
	@DeleteMapping("/user/{userId}")
	private ResponseEntity<?> deleteUser(@PathVariable long userId) {
		return appUserService.deleteUser(userId);
	}

}
