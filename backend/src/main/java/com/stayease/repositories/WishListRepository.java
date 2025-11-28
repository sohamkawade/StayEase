package com.stayease.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.stayease.models.WishList;


@Repository
public interface WishListRepository extends JpaRepository<WishList, Long>{

	List<WishList> findByUser_Id(Long userId);
	
}
