package com.stayease.dto;

import lombok.Data;

@Data
public class GoogleOAuthRequest {
    private String email;
    private String name;
    private String providerId; 
    private String picture; 
}

