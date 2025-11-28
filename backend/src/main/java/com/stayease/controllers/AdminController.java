package com.stayease.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stayease.models.Admin;
import com.stayease.dto.ChangePasswordRequest;
import com.stayease.services.AdminService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AdminController {

	private final AdminService adminService;
	
	@GetMapping("/admin/{adminId}")
	public ResponseEntity<?> getAdminById(@PathVariable long adminId){
		return adminService.getAdminById(adminId);
	}
	
	@PatchMapping("/auth/admin/{adminId}")
	public ResponseEntity<?> updateAdmin(@RequestBody Admin admin, @PathVariable long adminId){
		return adminService.updateAdmin(admin, adminId);
	}

	@PutMapping("/auth/admin/{adminId}/password")
	public ResponseEntity<?> changeAdminPassword(
			@PathVariable Long adminId,
			@RequestBody ChangePasswordRequest request
	) {
		return adminService.changeAdminPassword(request, adminId);
	}

}
