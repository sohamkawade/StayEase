package com.stayease.jwt;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.stayease.services.MyUserDetailsService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JWTRequestValidator extends OncePerRequestFilter {

	@Autowired
	JWTTokenGenerator jwtTokenGenerator;

	@Autowired
	MyUserDetailsService myUserDetailsService;

	@Override
	protected void doFilterInternal(
			HttpServletRequest request, 
			HttpServletResponse response, 
			FilterChain filterChain)
			throws ServletException, IOException {

		// Skip JWT validation for public endpoints if no token is present
		final String header = request.getHeader("Authorization");
		
		// If no authorization header, continue without authentication (for public endpoints)
		if (header == null || !header.startsWith("Bearer ")) {
			filterChain.doFilter(request, response);
			return;
		}

		String jwtToken = header.substring(7);
		String email = null;
		String role = null;
		Long userId = null;

		try {
			email = jwtTokenGenerator.extractEmail(jwtToken);
			role = jwtTokenGenerator.extractRole(jwtToken);
			userId = jwtTokenGenerator.extractUserId(jwtToken);
		} catch (Exception e) {
			// Invalid token - continue without authentication (for public endpoints)
			System.out.println("Invalid Token: " + e.getMessage());
			filterChain.doFilter(request, response);
			return;
		}

		if (SecurityContextHolder.getContext().getAuthentication() == null) {
			if (userId != null) {
				try {
					UserDetails userDetails = myUserDetailsService.loadUserById(userId);
					if (jwtTokenGenerator.validateToken(jwtToken, userId)) {
						setAuthentication(request, userDetails, role);
					}
				} catch (Exception e) {
					System.out.println("Error validating token: " + e.getMessage());
				}
			} else if (email != null && role != null) {
				try {
					UserDetails userDetails = myUserDetailsService.loadByRoleAndEmail(role, email);
					if (jwtTokenGenerator.validateToken(jwtToken, userDetails)) {
						setAuthentication(request, userDetails, role);
					}
				} catch (Exception e) {
					System.out.println("Error validating token: " + e.getMessage());
				}
			}
		}

		filterChain.doFilter(request, response);
	}

	private void setAuthentication(HttpServletRequest request, UserDetails userDetails, String role) {
		List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(role));
		UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
				userDetails,
				null,
				authorities
		);
		authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
		SecurityContextHolder.getContext().setAuthentication(authToken);
	}
}

