package com.stayease.models;

import java.time.LocalDate;

import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@EntityListeners(AuditingEntityListener.class)
public class StayEaseFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private AppUser user;

    @Column(nullable = false, length = 500)
    private String message;

    private int rating; 

    private LocalDate date;
}
