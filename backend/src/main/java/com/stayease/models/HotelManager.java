package com.stayease.models;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.stayease.enums.Role;

@Entity
@Data
@EntityListeners(AuditingEntityListener.class)
public class HotelManager {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String firstname;
    
    @Column(nullable = false, length = 50)
    private String lastname;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 10)
    private String contactNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
    
    @OneToOne(mappedBy = "manager")
    @JsonIgnore
    private Hotel hotel;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
