package com.stayease.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.stayease.models.AppUser;
import com.stayease.models.Booking;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long>, JpaSpecificationExecutor<Booking> {

	@Query("SELECT b FROM Booking b LEFT JOIN FETCH b.room LEFT JOIN FETCH b.appUser WHERE b.appUser.id = :userId")
	List<Booking> findByAppUser_Id(@Param("userId") long userId);

	@Query("SELECT b FROM Booking b LEFT JOIN FETCH b.room LEFT JOIN FETCH b.appUser WHERE b.hotel.id = :hotelId")
	List<Booking> findByHotel_Id(@Param("hotelId") long hotelId);

	@Query("SELECT DISTINCT b.appUser FROM Booking b WHERE b.room.hotel.id = :hotelId")
	List<AppUser> findDistinctGuestsByHotelId(@Param("hotelId") long hotelId);

	@Query("SELECT b FROM Booking b WHERE b.room.id = :roomId")
	List<Booking> findByRoomId(@Param("roomId") Long roomId);

}
