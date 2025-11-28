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

		final String header = request.getHeader("Authorization");
		String jwtToken = null;
		String email = null;
		String role = null;
		Long userId = null;

		if (header != null && header.startsWith("Bearer ")) {
			jwtToken = header.substring(7);
			try {
				email = jwtTokenGenerator.extractEmail(jwtToken);
				role = jwtTokenGenerator.extractRole(jwtToken);
				userId = jwtTokenGenerator.extractUserId(jwtToken);
			} catch (Exception e) {
				System.out.println("Invalid Token: " + e.getMessage());
			}
		}

		if (SecurityContextHolder.getContext().getAuthentication() == null) {
			if (userId != null) {
				UserDetails userDetails = myUserDetailsService.loadUserById(userId);
				if (jwtTokenGenerator.validateToken(jwtToken, userId)) {
					setAuthentication(request, userDetails, role);
				}
			} else if (email != null) {
				UserDetails userDetails = myUserDetailsService.loadByRoleAndEmail(role, email);
				if (jwtTokenGenerator.validateToken(jwtToken, userDetails)) {
					setAuthentication(request, userDetails, role);
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

