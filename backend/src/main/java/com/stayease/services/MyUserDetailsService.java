package com.stayease.services;

import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.stayease.models.Admin;
import com.stayease.models.HotelManager;
import com.stayease.enums.Role;
import com.stayease.models.User;
import com.stayease.repositories.AdminRepository;
import com.stayease.repositories.HotelManagerRepository;
import com.stayease.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MyUserDetailsService implements UserDetailsService {

	private final UserRepository userRepository;
	private final AdminRepository adminRepository;
	private final HotelManagerRepository hotelManagerRepository;

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException("Email not found :" + email));
		return buildUserDetails(user);
	}

	public UserDetails loadUserById(Long userId) throws UsernameNotFoundException {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new UsernameNotFoundException("User not found with id :" + userId));
		return buildUserDetails(user);
	}

	public UserDetails loadByRoleAndEmail(String role, String email) throws UsernameNotFoundException {
		if (Role.ADMIN.name().equalsIgnoreCase(role)) {
			Admin admin = adminRepository.findAdminByEmail(email)
					.orElseThrow(() -> new UsernameNotFoundException("Admin not found :" + email));
			return buildAdminDetails(admin);
		}
		if (Role.HOTEL_MANAGER.name().equalsIgnoreCase(role)) {
			HotelManager manager = hotelManagerRepository.findManagerByEmail(email)
					.orElseThrow(() -> new UsernameNotFoundException("Manager not found :" + email));
			return buildManagerDetails(manager);
		}
		return loadUserByUsername(email);
	}

	private UserDetails buildUserDetails(User user) {
		String role = "USER";
		if (user.getAppUser() != null && user.getAppUser().getRole() != null) {
			role = user.getAppUser().getRole().name();
		}

		String password = user.getPassword() != null ? user.getPassword() : "";

		List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(role));

		return new org.springframework.security.core.userdetails.User(
				user.getEmail(),
				password,
				authorities
		);
	}

	private UserDetails buildAdminDetails(Admin admin) {
		List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(admin.getRole().name()));
		return new org.springframework.security.core.userdetails.User(
				admin.getEmail(),
				admin.getPassword(),
				authorities
		);
	}

	private UserDetails buildManagerDetails(HotelManager manager) {
		List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(manager.getRole().name()));
		return new org.springframework.security.core.userdetails.User(
				manager.getEmail(),
				manager.getPassword(),
				authorities
		);
	}
}

