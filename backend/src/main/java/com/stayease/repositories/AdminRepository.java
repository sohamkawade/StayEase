package com.stayease.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.stayease.models.Admin;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long>{
	Optional<Admin> findAdminByEmail(String email);
}
