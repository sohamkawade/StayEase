package com.stayease.jwt;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;

@Component
public class JWTTokenGenerator {

	@Value("${jwt.secret}")
	private String SECRET;

	private SecretKey getSigningKey() {
		return Keys.hmacShaKeyFor(SECRET.getBytes());
	}

	public String extractEmail(String token) {
		Claims claims = extractAllClaims(token);
		return claims.get("email", String.class);
	}

	public Long extractUserId(String token) {
		Claims claims = extractAllClaims(token);
		Object userId = claims.get("userId");
		if (userId instanceof Integer) {
			return ((Integer) userId).longValue();
		}
		if (userId instanceof Long) {
			return (Long) userId;
		}
		if (userId instanceof String) {
			return Long.valueOf((String) userId);
		}
		return null;
	}

	public String extractRole(String token) {
		Claims claims = extractAllClaims(token);
		return claims.get("role", String.class);
	}

	private Claims extractAllClaims(String token) {
		return Jwts.parser()
				.verifyWith(getSigningKey())
				.build()
				.parseSignedClaims(token)
				.getPayload();
	}

	private Boolean isExpired(String token) {
		Claims claims = extractAllClaims(token);
		Date expiration = claims.getExpiration();
		return expiration.before(new Date());
	}

	public Boolean validateToken(String token, UserDetails userDetails) {
		String email = extractEmail(token);
		return (email != null && email.equals(userDetails.getUsername()) && !isExpired(token));
	}

	public Boolean validateToken(String token, Long expectedUserId) {
		Long tokenUserId = extractUserId(token);
		return (tokenUserId != null && tokenUserId.equals(expectedUserId) && !isExpired(token));
	}

	public String generateToken(UserDetails userDetails, String role) {
		return generateToken(userDetails, role, null);
	}

	public String generateToken(UserDetails userDetails, String role, Long userId) {
		Map<String, Object> claims = new HashMap<>();
		claims.put("email", userDetails.getUsername());
		claims.put("role", role);
		if (userId != null) {
			claims.put("userId", userId);
		}
		return Jwts.builder()
				.claims(claims)
				.subject(userDetails.getUsername())
				.issuedAt(new Date())
				.expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24))
				.signWith(getSigningKey())
				.compact();
	}
}

