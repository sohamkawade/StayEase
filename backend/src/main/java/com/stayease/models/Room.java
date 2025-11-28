package com.stayease.models;

import java.time.Instant;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;
import com.stayease.enums.RoomStatus;

@Entity
@Table(name = "room", uniqueConstraints = {
        @UniqueConstraint(name = "UK_room_hotel_roomNumber", columnNames = { "hotel_id", "roomNumber" })
})
@Data
@EntityListeners(AuditingEntityListener.class)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String roomNumber;

    @Column(nullable = false)
    private String roomType;

    @Column(nullable = false)
    private double price;

    @Enumerated(EnumType.STRING)
    private RoomStatus status;

    private Integer capacity;

    @Column(length = 50)
    private String bedType;

    @Column(length = 50)
    private String viewType;

    @Column(length = 500)
    private String description;

    @ElementCollection
    @CollectionTable(name = "room_amenities", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "amenity")
    private List<String> amenities;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"room"})
    private List<RoomImage> images;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    @JsonIgnore
    private Hotel hotel;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Booking> bookings;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<WishList> wishLists;

    @CreatedDate
    @Column(updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

}
