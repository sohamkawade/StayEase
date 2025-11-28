package com.stayease.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.stayease.models.Hotel;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long>, JpaSpecificationExecutor<Hotel>{

}
