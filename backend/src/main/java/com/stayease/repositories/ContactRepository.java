package com.stayease.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.stayease.models.Contact;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long>{
	
}
