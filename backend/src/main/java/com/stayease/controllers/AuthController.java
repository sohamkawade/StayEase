package com.stayease.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stayease.models.Admin;
import com.stayease.dto.ForgotPasswordRequest;
import com.stayease.dto.GoogleOAuthRequest;
import com.stayease.dto.LoginRequest;
import com.stayease.dto.ResetPasswordRequest;
import com.stayease.dto.VerifyOTPRequest;
import com.stayease.services.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class AuthController {
	
	private final AuthService authService;
	
	@PostMapping("/auth/user/signup")
	private ResponseEntity<?> registerUser(@RequestBody com.stayease.dto.SignupRequest signupRequest){
		return authService.registerUser(signupRequest);
	}
	
	@PostMapping("/auth/admin/signup")
	public ResponseEntity<?> registerAdmin(@RequestBody Admin admin){
		return authService.registerAdmin(admin);
	}
	
	@PostMapping("/auth/login")
	private ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
	    return authService.login(loginRequest.getEmail(), loginRequest.getPassword());
	}
	
	@PostMapping("/auth/google")
	private ResponseEntity<?> googleOAuth(@RequestBody GoogleOAuthRequest request) {
		return authService.handleGoogleOAuthFromFrontend(request);
	}
	
	@PostMapping("/auth/forgot-password/send-otp")
	public ResponseEntity<?> sendForgotPasswordOTP(@RequestBody ForgotPasswordRequest request) {
		return authService.sendForgotPasswordOTP(request.getEmail());
	}
	
	@PostMapping("/auth/forgot-password/verify-otp")
	public ResponseEntity<?> verifyOTP(@RequestBody VerifyOTPRequest request) {
		return authService.verifyOTP(request.getEmail(), request.getOtp());
	}
	
	@PostMapping("/auth/forgot-password/reset")
	public ResponseEntity<?> verifyOTPAndResetPassword(@RequestBody ResetPasswordRequest request) {
		return authService.verifyOTPAndResetPassword(request);
	}

}
