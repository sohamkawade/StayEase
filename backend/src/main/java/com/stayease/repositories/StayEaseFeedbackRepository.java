package com.stayease.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.stayease.models.StayEaseFeedback;

@Repository
public interface StayEaseFeedbackRepository extends JpaRepository<StayEaseFeedback, Long>{

}
