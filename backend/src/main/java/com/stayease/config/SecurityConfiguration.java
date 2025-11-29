package com.stayease.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import com.stayease.jwt.JWTRequestValidator;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    @Autowired
    private JWTRequestValidator jwtRequestValidator;

    private static final String[] GENERAL_WHITELIST = {
            "/uploads/**",
            "/error",
            "/swagger-ui/**",
            "/v3/api-docs/**"
    };

    private static final String[] PUBLIC_POST_ENDPOINTS = {
            "/api/auth/login",
            "/api/auth/user/signup",
            "/api/auth/admin/signup",
            "/api/auth/google",
            "/api/auth/forgot-password/send-otp",
            "/api/auth/forgot-password/verify-otp",
            "/api/auth/forgot-password/reset",
            "/api/send-message"
    };

    private static final String[] PUBLIC_GET_ENDPOINTS = {
            "/api/hotels/**",
            "/api/rooms/**",
            "/api/room/**",
            "/api/feedbacks",
            "/api/feedback/hotel/**",
            "/api/feedback/user/**",
            "/api/stats/**",
    };

    private static final String[] ADMIN_ONLY_ENDPOINTS = {
            "/api/admin/**",
            "/api/auth/admin/**",
            "/api/get-messages",
            "/api/message/**",
            "/api/users"
    };

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*"); 
        config.addAllowedHeader("*");
        config.addAllowedMethod("*"); 
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {}) 
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() 
                .requestMatchers(GENERAL_WHITELIST).permitAll()
                .requestMatchers(HttpMethod.POST, PUBLIC_POST_ENDPOINTS).permitAll()
                .requestMatchers(HttpMethod.GET, PUBLIC_GET_ENDPOINTS).permitAll()
                .requestMatchers(ADMIN_ONLY_ENDPOINTS).hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/user/**").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/user/**").hasAnyAuthority("ADMIN", "USER", "HOTEL_MANAGER")
                .requestMatchers(HttpMethod.PATCH, "/api/auth/user/**").hasAnyAuthority("ADMIN", "USER", "HOTEL_MANAGER")
                .requestMatchers(HttpMethod.POST, "/api/hotels/**", "/api/rooms/**", "/api/manager/**")
                    .hasAnyAuthority("ADMIN", "HOTEL_MANAGER")
                .requestMatchers(HttpMethod.PATCH, "/api/hotels/**", "/api/rooms/**", "/api/manager/**")
                    .hasAnyAuthority("ADMIN", "HOTEL_MANAGER")
                .requestMatchers(HttpMethod.PUT, "/api/hotels/**", "/api/manager/**")
                    .hasAnyAuthority("ADMIN", "HOTEL_MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/api/hotels/**", "/api/rooms/**")
                    .hasAnyAuthority("ADMIN", "HOTEL_MANAGER")
                .requestMatchers(HttpMethod.GET, "/api/manager/**")
                    .hasAnyAuthority("ADMIN", "HOTEL_MANAGER")
                .requestMatchers("/api/bookings", "/api/bookings/hotel/**", "/api/guests/**", "/api/guests/send-email")
                    .hasAnyAuthority("ADMIN", "HOTEL_MANAGER")
                .requestMatchers(HttpMethod.PATCH, "/api/bookings/*/status")
                    .hasAnyAuthority("ADMIN", "HOTEL_MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/api/bookings/**")
                    .hasAnyAuthority("ADMIN", "HOTEL_MANAGER")
                .requestMatchers(
                        "/api/bookroom",
                        "/api/bookings/user/**",
                        "/api/add-to-wishlist/**",
                        "/api/get-wishlist/**",
                        "/api/remove-wishlist/**",
                        "/api/feedback/submit",
                        "/api/submit/**"
                ).hasAnyAuthority("USER", "ADMIN", "HOTEL_MANAGER")
                .requestMatchers(HttpMethod.POST, "/api/bookings/*/cancel").hasAnyAuthority("USER", "ADMIN", "HOTEL_MANAGER")
                .requestMatchers(HttpMethod.PATCH, "/api/bookings/*/cancel/user/*").hasAnyAuthority("USER", "ADMIN", "HOTEL_MANAGER")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );

        http.addFilterBefore(jwtRequestValidator, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
