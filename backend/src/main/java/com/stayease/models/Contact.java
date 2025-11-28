package com.stayease.models;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
@EntityListeners(AuditingEntityListener.class)
public class Contact {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;
	
	@Column(nullable = false)
	private String firstname;
	@Column(nullable = false)
	private String lastname;
	@Column(nullable = false)
	private String email;
	@Column(nullable = false)
	private String contactNumber;
	@Column(nullable = false)
	private String message;

	@CreatedDate
	private Instant createdAt;

}
