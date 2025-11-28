package com.stayease.models;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.stayease.enums.Role;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Admin {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable = false)
	private String firstname;
	
	@Column(nullable = false)
	private String lastname;
	
	@Column(nullable = false,unique = true)
	private String email;
	
	@Column(nullable = false)
	private String password;
	
	@Column(nullable = false)
	private String contactNumber;
	
	
	@Enumerated(EnumType.STRING)
	private Role role;
	
	@CreatedDate
	private Instant createdAt;
	
	@LastModifiedDate
	private Instant updatedAt;
}
