package com.stayease.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.stayease.models.Room;

@Repository
public interface RoomRepository extends JpaRepository<Room,Long>, JpaSpecificationExecutor<Room>{
    List<Room> findByHotelId(Long hotelId);

    @Query("select distinct r from Room r left join fetch r.images where r.hotel.id = :hotelId")
    List<Room> findByHotelIdWithImages(@Param("hotelId") Long hotelId);
    
    boolean existsByHotelIdAndRoomNumber(Long hotelId, String roomNumber);
}
