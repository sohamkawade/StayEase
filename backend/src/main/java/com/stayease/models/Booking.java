package com.stayease.models;

import java.time.Instant;
import java.time.LocalDate;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;
import com.stayease.enums.BookingStatus;
import com.stayease.enums.PaymentStatus;

@Entity
@Data
@EntityListeners(AuditingEntityListener.class)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private BookingStatus bookingStatus;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    private LocalDate checkInDate;

    private LocalDate checkOutDate;

    private Integer totalGuests;

	private Double totalAmount;

	private String transactionId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private AppUser appUser;

    @ManyToOne
    @JoinColumn(name = "hotel_id")
    private Hotel hotel;

    @ManyToOne
    @JoinColumn(name = "room_id")
    @JsonIgnoreProperties({"bookings", "hotel", "images"})
    private Room room;

    @CreatedDate
    @Column(updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
