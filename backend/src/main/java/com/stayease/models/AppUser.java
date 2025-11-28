package com.stayease.models;

import java.time.Instant;
import java.util.List;

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
import jakarta.persistence.CascadeType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import lombok.Data;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.stayease.enums.Role;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AppUser {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable = false)
	private String firstname;
	
	@Column(nullable = false)
	private String lastname;
	
	@Column(nullable = false, length = 10)
	private String contactNumber;
	
	private String profilePicture;
	
	@Enumerated(EnumType.STRING)
	private Role role;
	
	@CreatedDate
	private Instant createdAt;
	
	@LastModifiedDate
	private Instant updatedAt;
	
	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonIgnore
	private List<StayEaseFeedback> stayEaseFeedbacks;
	
	@OneToMany(mappedBy = "appUser", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonIgnore
	private List<Booking> bookings;
	
	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonIgnore
	private List<HotelFeedback> hotelFeedbacks;
	
	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonIgnore
	private List<WishList> wishLists;
	
	@OneToOne(mappedBy = "appUser", cascade = CascadeType.ALL)
	@JsonIgnoreProperties(value = { "appUser" }, allowSetters = true)
	private User user;

}
