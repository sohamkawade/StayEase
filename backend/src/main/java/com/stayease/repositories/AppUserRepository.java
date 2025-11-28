package com.stayease.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.stayease.models.AppUser;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Long>, JpaSpecificationExecutor<AppUser>{
	
}
