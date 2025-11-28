package com.stayease.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.stayease.MyResponseWrapper;
import com.stayease.jwt.JWTTokenGenerator;
import com.stayease.models.Admin;
import com.stayease.models.AppUser;
import com.stayease.enums.AuthProviderType;
import com.stayease.dto.GoogleOAuthRequest;
import com.stayease.models.HotelManager;
import com.stayease.dto.ResetPasswordRequest;
import com.stayease.enums.Role;
import com.stayease.models.User;
import com.stayease.repositories.AdminRepository;
import com.stayease.repositories.AppUserRepository;
import com.stayease.repositories.HotelManagerRepository;
import com.stayease.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

	private final AdminRepository adminRepository;
	private final AppUserRepository appUserRepository;
	private final UserRepository userRepository;
	private final MyResponseWrapper responseWrapper;
	private final PasswordEncoder passwordEncoder;
	private final HotelManagerRepository hotelManagerRepository;
	private final EmailService emailService;
	private final JWTTokenGenerator jwtTokenGenerator;
	private final MyUserDetailsService myUserDetailsService;
	
	private final Map<String, String> otpStorage = new ConcurrentHashMap<>();

	public ResponseEntity<?> registerUser(com.stayease.dto.SignupRequest signupRequest) {
		String email = signupRequest.getEmail();
		if (email == null || email.isEmpty()) {
			return universalResponse("Email is required", null, HttpStatus.BAD_REQUEST);
		}
		
		Optional<User> existingUser = userRepository.findByEmail(email);
		if (existingUser.isPresent()) {
			return universalResponse("Email already registered", null, HttpStatus.CONFLICT);
		}
		
		AppUser appUser = new AppUser();
		appUser.setFirstname(signupRequest.getFirstname());
		appUser.setLastname(signupRequest.getLastname());
		appUser.setContactNumber(signupRequest.getContactNumber());
		appUser.setRole(Role.USER);
		AppUser savedAppUser = appUserRepository.save(appUser);
		
		User user = new User();
		user.setEmail(email);
		user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
		user.setAuthProviderType(AuthProviderType.LOCAL);
		user.setIsGoogleUser(false);
		user.setAppUser(savedAppUser);
		
		User savedUser = userRepository.save(user);
		
		org.springframework.security.core.userdetails.UserDetails userDetails = myUserDetailsService.loadUserByUsername(email);
		String token = jwtTokenGenerator.generateToken(userDetails, savedAppUser.getRole().name(), savedUser.getId());
		
		Map<String, Object> responseData = new HashMap<>();
		responseData.put("user", savedAppUser);
		responseData.put("token", token);
		
		return universalResponse("User registered successfully", responseData, HttpStatus.OK);
	}

	public ResponseEntity<?> registerAdmin(Admin admin) {
		String encodedPassword = passwordEncoder.encode(admin.getPassword());
		admin.setPassword(encodedPassword);
		admin.setRole(Role.ADMIN);
		Admin savedUser = adminRepository.save(admin);
		return universalResponse("Admin registered successfully", savedUser, HttpStatus.OK);
	}

	public ResponseEntity<?> login(String email, String password) {
		Optional<User> existingUser = userRepository.findByEmail(email);
		
		if (existingUser.isPresent()) {
			User user = existingUser.get();
			
			if (user.getIsGoogleUser() != null && user.getIsGoogleUser()) {
				return universalResponse("Please use Google login for this account", null, HttpStatus.BAD_REQUEST);
			}
			
			if (user.getPassword() == null || !passwordEncoder.matches(password, user.getPassword())) {
				return universalResponse("Invalid password!", null, HttpStatus.UNAUTHORIZED);
			}
			
			AppUser appUser = user.getAppUser();
			if (appUser == null) {
				return universalResponse("User account not properly configured", null, HttpStatus.INTERNAL_SERVER_ERROR);
			}
			
			org.springframework.security.core.userdetails.UserDetails userDetails = myUserDetailsService.loadUserByUsername(email);
			String token = jwtTokenGenerator.generateToken(userDetails, appUser.getRole().name(), user.getId());
			
			Map<String, Object> responseData = new HashMap<>();
			responseData.put("user", appUser);
			responseData.put("token", token);
			
			return universalResponse("Login successful!", responseData, HttpStatus.OK);
		}
		
		Optional<Admin> existingAdmin = adminRepository.findAdminByEmail(email);
		if (existingAdmin.isPresent()) {
			Admin admin = existingAdmin.get();
			if (passwordEncoder.matches(password, admin.getPassword())) {
				org.springframework.security.core.userdetails.UserDetails adminDetails = 
					new org.springframework.security.core.userdetails.User(
						email, 
						admin.getPassword(), 
						List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority(admin.getRole().name()))
					);
				String token = jwtTokenGenerator.generateToken(adminDetails, admin.getRole().name());
				Map<String, Object> responseData = new HashMap<>();
				responseData.put("user", admin);
				responseData.put("token", token);
				return universalResponse("Login successful!", responseData, HttpStatus.OK);
			} else {
				return universalResponse("Invalid password!", null, HttpStatus.UNAUTHORIZED);
			}
		}
		
		Optional<HotelManager> existingManager = hotelManagerRepository.findManagerByEmail(email);
		if (existingManager.isPresent()) {
			HotelManager manager = existingManager.get();
			if (passwordEncoder.matches(password, manager.getPassword())) {
				org.springframework.security.core.userdetails.UserDetails managerDetails = 
					new org.springframework.security.core.userdetails.User(
						email, 
						manager.getPassword(), 
						List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority(manager.getRole().name()))
					);
				String token = jwtTokenGenerator.generateToken(managerDetails, manager.getRole().name());
				Map<String, Object> responseData = new HashMap<>();
				responseData.put("user", manager);
				responseData.put("token", token);
				return universalResponse("Login successful!", responseData, HttpStatus.OK);
			} else {
				return universalResponse("Invalid password!", null, HttpStatus.UNAUTHORIZED);
			}
		}

		return universalResponse("Email does not exist!", null, HttpStatus.NOT_FOUND);
	}
	
	public ResponseEntity<?> handleGoogleOAuth(OAuth2User oauth2User) {
		String email = oauth2User.getAttribute("email");
		String name = oauth2User.getAttribute("name");
		String providerId = oauth2User.getAttribute("sub");
		
		if (email == null || email.isEmpty()) {
			return universalResponse("Email not provided by Google", null, HttpStatus.BAD_REQUEST);
		}
		
		Optional<User> existingUser = userRepository.findByProviderId(providerId);
		
		if (existingUser.isPresent()) {
			User user = existingUser.get();
			AppUser appUser = user.getAppUser();
			
			if (appUser == null) {
				return universalResponse("User account not properly configured", null, HttpStatus.INTERNAL_SERVER_ERROR);
			}
			
			org.springframework.security.core.userdetails.UserDetails userDetails = myUserDetailsService.loadUserByUsername(email);
			String token = jwtTokenGenerator.generateToken(userDetails, appUser.getRole().name(), user.getId());
			
			Map<String, Object> responseData = new HashMap<>();
			responseData.put("user", appUser);
			responseData.put("token", token);
			
			return universalResponse("Login successful!", responseData, HttpStatus.OK);
		}
		
		Optional<User> existingUserByEmail = userRepository.findByEmail(email);
		if (existingUserByEmail.isPresent()) {
			return universalResponse("Email already registered with local account. Please use email/password login.", null, HttpStatus.CONFLICT);
		}
		
		String[] nameParts = name != null ? name.split(" ", 2) : new String[]{"", ""};
		String firstname = nameParts.length > 0 ? nameParts[0] : "";
		String lastname = nameParts.length > 1 ? nameParts[1] : "";
		
		AppUser appUser = new AppUser();
		appUser.setFirstname(firstname);
		appUser.setLastname(lastname);
		appUser.setContactNumber("");
		appUser.setRole(Role.USER);
		AppUser savedAppUser = appUserRepository.save(appUser);
		
		User user = new User();
		user.setEmail(email);
		user.setProviderId(providerId);
		user.setAuthProviderType(AuthProviderType.GOOGLE);
		user.setIsGoogleUser(true);
		user.setAppUser(savedAppUser);
		User savedUser = userRepository.save(user);
		
		org.springframework.security.core.userdetails.UserDetails userDetails = myUserDetailsService.loadUserByUsername(email);
		String token = jwtTokenGenerator.generateToken(userDetails, savedAppUser.getRole().name(), savedUser.getId());
		
		Map<String, Object> responseData = new HashMap<>();
		responseData.put("user", savedAppUser);
		responseData.put("token", token);
		
		return universalResponse("User registered and logged in successfully!", responseData, HttpStatus.OK);
	}

	public ResponseEntity<?> handleGoogleOAuthFromFrontend(GoogleOAuthRequest request) {
		String email = request.getEmail();
		String name = request.getName();
		String providerId = request.getProviderId();
		
		if (email == null || email.isEmpty()) {
			return universalResponse("Email not provided by Google", null, HttpStatus.BAD_REQUEST);
		}
		
		if (providerId == null || providerId.isEmpty()) {
			return universalResponse("Provider ID not provided by Google", null, HttpStatus.BAD_REQUEST);
		}
		
		Optional<User> existingUser = userRepository.findByProviderId(providerId);
		
		if (existingUser.isPresent()) {
			User user = existingUser.get();
			AppUser appUser = user.getAppUser();
			
			if (appUser == null) {
				return universalResponse("User account not properly configured", null, HttpStatus.INTERNAL_SERVER_ERROR);
			}
			
			org.springframework.security.core.userdetails.UserDetails userDetails = myUserDetailsService.loadUserByUsername(email);
			String token = jwtTokenGenerator.generateToken(userDetails, appUser.getRole().name(), user.getId());
			
			Map<String, Object> responseData = new HashMap<>();
			responseData.put("user", appUser);
			responseData.put("token", token);
			
			return universalResponse("Login successful!", responseData, HttpStatus.OK);
		}
		
		Optional<User> existingUserByEmail = userRepository.findByEmail(email);
		if (existingUserByEmail.isPresent()) {
			return universalResponse("Email already registered with local account. Please use email/password login.", null, HttpStatus.CONFLICT);
		}
		
		String[] nameParts = name != null ? name.split(" ", 2) : new String[]{"", ""};
		String firstname = nameParts.length > 0 ? nameParts[0] : "";
		String lastname = nameParts.length > 1 ? nameParts[1] : "";
		
		AppUser appUser = new AppUser();
		appUser.setFirstname(firstname);
		appUser.setLastname(lastname);
		appUser.setContactNumber("");
		appUser.setRole(Role.USER);
		if (request.getPicture() != null && !request.getPicture().isEmpty()) {
			appUser.setProfilePicture(request.getPicture());
		}
		AppUser savedAppUser = appUserRepository.save(appUser);
		
		User user = new User();
		user.setEmail(email);
		user.setProviderId(providerId);
		user.setAuthProviderType(AuthProviderType.GOOGLE);
		user.setIsGoogleUser(true);
		user.setAppUser(savedAppUser);
		User savedUser = userRepository.save(user);
		
		org.springframework.security.core.userdetails.UserDetails userDetails = myUserDetailsService.loadUserByUsername(email);
		String token = jwtTokenGenerator.generateToken(userDetails, savedAppUser.getRole().name(), savedUser.getId());
		
		Map<String, Object> responseData = new HashMap<>();
		responseData.put("user", savedAppUser);
		responseData.put("token", token);
		
		return universalResponse("User registered and logged in successfully!", responseData, HttpStatus.OK);
	}

	public ResponseEntity<?> sendForgotPasswordOTP(String email) {
		Optional<Admin> existingAdmin = adminRepository.findAdminByEmail(email);
		if (existingAdmin.isPresent()) {
			String otp = generateOTP();
			otpStorage.put(email, otp);
			emailService.sendOTPEmail(email, otp);
			return universalResponse("OTP sent to your email", null, HttpStatus.OK);
		}

		Optional<User> existingUser = userRepository.findByEmail(email);
		if (existingUser.isPresent()) {
			String otp = generateOTP();
			otpStorage.put(email, otp);
			emailService.sendOTPEmail(email, otp);
			return universalResponse("OTP sent to your email", null, HttpStatus.OK);
		}
		
		Optional<HotelManager> existingManager = hotelManagerRepository.findManagerByEmail(email);
		if (existingManager.isPresent()) {
			String otp = generateOTP();
			otpStorage.put(email, otp);
			emailService.sendOTPEmail(email, otp);
			return universalResponse("OTP sent to your email", null, HttpStatus.OK);
		}

		return universalResponse("Email not found", null, HttpStatus.NOT_FOUND);
	}
	
	public ResponseEntity<?> verifyOTP(String email, String otp) {
		String storedOTP = otpStorage.get(email);
		if (storedOTP == null || !storedOTP.equals(otp)) {
			return universalResponse("Invalid OTP", null, HttpStatus.BAD_REQUEST);
		}
		return universalResponse("OTP verified successfully", null, HttpStatus.OK);
	}
	
	public ResponseEntity<?> verifyOTPAndResetPassword(ResetPasswordRequest request) {
		String email = request.getEmail();
		String otp = request.getOtp();
		String newPassword = request.getNewPassword();
		
		String storedOTP = otpStorage.get(email);
		if (storedOTP == null || !storedOTP.equals(otp)) {
			return universalResponse("Invalid OTP", null, HttpStatus.BAD_REQUEST);
		}
		
		Optional<Admin> existingAdmin = adminRepository.findAdminByEmail(email);
		if (existingAdmin.isPresent()) {
			Admin admin = existingAdmin.get();
			String encodedPassword = passwordEncoder.encode(newPassword);
			admin.setPassword(encodedPassword);
			adminRepository.save(admin);
			otpStorage.remove(email);
			return universalResponse("Password reset successfully", null, HttpStatus.OK);
		}

		Optional<User> existingUser = userRepository.findByEmail(email);
		if (existingUser.isPresent()) {
			User user = existingUser.get();
			String encodedPassword = passwordEncoder.encode(newPassword);
			user.setPassword(encodedPassword);
			userRepository.save(user);
			otpStorage.remove(email);
			return universalResponse("Password reset successfully", null, HttpStatus.OK);
		}
		
		Optional<HotelManager> existingManager = hotelManagerRepository.findManagerByEmail(email);
		if (existingManager.isPresent()) {
			HotelManager manager = existingManager.get();
			String encodedPassword = passwordEncoder.encode(newPassword);
			manager.setPassword(encodedPassword);
			hotelManagerRepository.save(manager);
			otpStorage.remove(email);
			return universalResponse("Password reset successfully", null, HttpStatus.OK);
		}

		return universalResponse("User not found", null, HttpStatus.NOT_FOUND);
	}
	
	private String generateOTP() {
		Random random = new Random();
		int otp = 1000 + random.nextInt(9000);
		return String.valueOf(otp);
	}

	private ResponseEntity<?> universalResponse(String message, Object data, HttpStatus httpStatus) {
		responseWrapper.setMessage(message);
		responseWrapper.setData(data);
		return new ResponseEntity<>(responseWrapper, httpStatus);
	}

}
