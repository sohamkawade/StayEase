package com.stayease.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.stayease.models.Address;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long>{

}
