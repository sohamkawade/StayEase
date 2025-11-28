package com.stayease.models;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Data
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String streetAddress;  
    private String city;        
    private String state;         
    private String pincode; 
    
    @OneToOne(mappedBy = "address")
    @JsonIgnore
    private Hotel hotel;
    
}
