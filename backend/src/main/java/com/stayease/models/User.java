package com.stayease.models;

import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.stayease.enums.AuthProviderType;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable = false)
	private String email;
	
	private Boolean isGoogleUser;
	
	private String password;
	
	private String providerId;
	
	@Enumerated(EnumType.STRING)
	private AuthProviderType authProviderType;
	
	@OneToOne
	@JoinColumn(name = "app_user_id")
	private AppUser appUser;

}

