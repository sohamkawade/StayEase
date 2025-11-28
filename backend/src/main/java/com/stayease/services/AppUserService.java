package com.stayease.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.stayease.MyResponseWrapper;
import com.stayease.models.AppUser;
import com.stayease.dto.ProfileResponse;
import com.stayease.models.User;
import com.stayease.repositories.AppUserRepository;
import com.stayease.repositories.UserRepository;
import com.stayease.specifications.UserSpecification;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AppUserService {

	private final AppUserRepository appUserRepository;
	private final MyResponseWrapper responseWrapper;
	private final UserRepository userRepository;
//	private final PasswordEncoder passwordEncoder;
	private static final String UPLOAD_DIR = "uploads/profile_pictures/";

	public ResponseEntity<?> getUserById(long userId) {
		Optional<AppUser> existingUser = appUserRepository.findById(userId);
		if (existingUser.isEmpty()) {
			return universalResponse("User not found with id:" + userId, null, HttpStatus.NOT_FOUND);
		}

		AppUser appUser = existingUser.get();
		User authUser = appUser.getUser();
		ProfileResponse response = new ProfileResponse();
		response.setId(appUser.getId());
		response.setFirstname(appUser.getFirstname());
		response.setLastname(appUser.getLastname());
		response.setContactNumber(appUser.getContactNumber());
		response.setProfilePicture(appUser.getProfilePicture());

		if (authUser != null) {
			response.setEmail(authUser.getEmail());
			response.setIsGoogleUser(authUser.getIsGoogleUser());
			response.setAuthProviderType(
					authUser.getAuthProviderType() != null ? authUser.getAuthProviderType().name() : null);
		}

		return universalResponse("User found", response, HttpStatus.OK);
	}

	public ResponseEntity<?> updateUser(AppUser user, MultipartFile profilePicture, long userId) throws IOException {
		Optional<AppUser> existingUserOpt = appUserRepository.findById(userId);
		if (existingUserOpt.isEmpty()) {
			return universalResponse("User not found with id: " + userId, null, HttpStatus.NOT_FOUND);
		}
		AppUser existingUser = existingUserOpt.get();
		existingUser.setFirstname(user.getFirstname());
		existingUser.setLastname(user.getLastname());
		existingUser.setContactNumber(user.getContactNumber());

		if (user.getUser() != null && user.getUser().getEmail() != null && existingUser.getUser() != null) {
			String updatedEmail = user.getUser().getEmail().trim();
			if (!updatedEmail.equalsIgnoreCase(existingUser.getUser().getEmail())) {
				boolean emailTaken = userRepository.findByEmail(updatedEmail)
						.filter(foundUser -> !foundUser.getId().equals(existingUser.getUser().getId()))
						.isPresent();
				if (emailTaken) {
					return universalResponse("Email already in use.", null, HttpStatus.CONFLICT);
				}
				existingUser.getUser().setEmail(updatedEmail);
				userRepository.save(existingUser.getUser());
			}
		}
		if (profilePicture != null && !profilePicture.isEmpty()) {
			String savedPath = saveFile(profilePicture);
			existingUser.setProfilePicture(savedPath);
		}
		if (user.getProfilePicture() != null && user.getProfilePicture().isEmpty()) {
			existingUser.setProfilePicture(null);
		}

		AppUser savedUser = appUserRepository.save(existingUser);
		return universalResponse("User updated successfully!", savedUser, HttpStatus.OK);
	}

	private String saveFile(MultipartFile file) throws IOException {
		Path uploadPath = Paths.get(UPLOAD_DIR);
		if (!Files.exists(uploadPath)) {
			Files.createDirectories(uploadPath);
		}

		String originalFileName = file.getOriginalFilename();
		String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
		String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

		Path filePath = uploadPath.resolve(uniqueFileName);
		Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

		return "uploads/profile_pictures/" + uniqueFileName;
	}

	public ResponseEntity<?> deleteUser(long userId) {
		Optional<AppUser> existingUser = appUserRepository.findById(userId);
		if (existingUser.isPresent()) {
			AppUser user = existingUser.get();
			appUserRepository.delete(user);
			return universalResponse("User deleted successfully!", null, HttpStatus.OK);
		} else {
			return universalResponse("User not foudn with id:" + userId, null, HttpStatus.NOT_FOUND);
		}
	}

	@Transactional
	public ResponseEntity<?> getAllUsers() {
		List<AppUser> users = appUserRepository.findAll();
		for (AppUser appUser : users) {
			if (appUser.getUser() != null) {
				org.hibernate.Hibernate.initialize(appUser.getUser());
			}
		}
		return universalResponse("Users fetched successfully", users, HttpStatus.OK);
	}

	@Transactional
	public ResponseEntity<?> getFilteredUsers(String search) {
		Specification<AppUser> allFilters = null;

		if (search != null && !search.isEmpty()) {
			allFilters = UserSpecification.searchInAllFields(search);
		}

		List<AppUser> filteredUsers = allFilters == null ? appUserRepository.findAll()
				: appUserRepository.findAll(allFilters);
		
		for (AppUser appUser : filteredUsers) {
			if (appUser.getUser() != null) {
				org.hibernate.Hibernate.initialize(appUser.getUser());
			}
		}
		
		return universalResponse("Users fetched successfully", filteredUsers, HttpStatus.OK);
	}

//	@Override
//	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
//		Optional<AppUser> existedUser = appUserRepository.findUserByEmail(email);
//		if(existedUser.isPresent()) {
//			AppUser user = existedUser.get();
//			return User.builder()
//			.username(email)
//			.password(user.getPassword())
//			.roles(user.getRole().name())
//			.build();
//		}
//		else {
//			throw new UsernameNotFoundException(email +" does not exist!");
//		}
//	}

	private ResponseEntity<?> universalResponse(String message, Object data, HttpStatus httpStatus) {
		responseWrapper.setMessage(message);
		responseWrapper.setData(data);
		return new ResponseEntity<>(responseWrapper, httpStatus);
	}

}
