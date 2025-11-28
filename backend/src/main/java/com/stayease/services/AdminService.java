package com.stayease.services;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stayease.MyResponseWrapper;
import com.stayease.models.Admin;
import com.stayease.dto.ChangePasswordRequest;
import com.stayease.repositories.AdminRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {

	private final AdminRepository adminRepository;
	private final MyResponseWrapper responseWrapper;
	private final PasswordEncoder passwordEncoder;


	public ResponseEntity<?> getAdminById(long adminId) {
		Optional<Admin> existingAdmin = adminRepository.findById(adminId);
		if (existingAdmin.isPresent()) {
			return universalResponse("Admin found", existingAdmin.get(), HttpStatus.OK);
		} else {
			return universalResponse("Admin not found with id:" + adminId, null, HttpStatus.NOT_FOUND);
		}
	}
	
	@Transactional
	public ResponseEntity<?> updateAdmin(Admin admin, long adminId){
		Optional<Admin> existingAdmin = adminRepository.findById(adminId);
		if(existingAdmin.isPresent()) {
			Admin updatedAdmin = existingAdmin.get();
			updatedAdmin.setFirstname(admin.getFirstname());
			updatedAdmin.setLastname(admin.getLastname());
			updatedAdmin.setContactNumber(admin.getContactNumber());
			updatedAdmin.setEmail(admin.getEmail());
			Admin savedAdmin = adminRepository.save(updatedAdmin);
			return universalResponse("Admin updated successfully!", savedAdmin, HttpStatus.OK);
		}
		else {
			return universalResponse("Admin not found with id:"+adminId, null, HttpStatus.NOT_FOUND);
		}
	}

	@Transactional
	public ResponseEntity<?> changeAdminPassword(ChangePasswordRequest request, long adminId) {
		Optional<Admin> existingAdmin = adminRepository.findById(adminId);
		if (existingAdmin.isPresent()) {
			Admin admin = existingAdmin.get();
			if (!passwordEncoder.matches(request.getCurrentPassword(), admin.getPassword())) {
				return universalResponse("Current password is incorrect", null, HttpStatus.BAD_REQUEST);
			}
			String encodedPassword = passwordEncoder.encode(request.getNewPassword());
			admin.setPassword(encodedPassword);
			adminRepository.save(admin);
			return universalResponse("Password changed successfully", null, HttpStatus.OK);
		} else {
			return universalResponse("Admin not found with id: " + adminId, null, HttpStatus.NOT_FOUND);
		}
	}
	

	private ResponseEntity<?> universalResponse(String message, Object data, HttpStatus httpStatus) {
		responseWrapper.setMessage(message);
		responseWrapper.setData(data);
		return new ResponseEntity<>(responseWrapper, httpStatus);
	}

}
