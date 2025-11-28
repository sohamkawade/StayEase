package com.stayease.controllers;

import java.io.IOException;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.stayease.services.RoomService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RoomController {

	private final RoomService roomService;

	@PostMapping("/rooms/add/{hotelId}")
	public ResponseEntity<?> addRoom(
	        @PathVariable long hotelId,
	        @RequestPart("room") String roomJson,
	        @RequestPart(value = "images", required = false) List<MultipartFile> roomImages
	) throws IOException {
	    return roomService.addRoom(hotelId, roomJson, roomImages);
	}

	@GetMapping("/rooms/{hotelId}")
	private ResponseEntity<?> getFilteredRooms(@PathVariable long hotelId,
			@RequestParam(required = false) String search, @RequestParam(required = false) String status,
			@RequestParam(required = false) String roomType,
			@RequestParam(required = false) Double minPrice, @RequestParam(required = false) Double maxPrice,
			@RequestParam(required = false) String sortBy, @RequestParam(required = false) String sortDirection) {
		return roomService.getFilteredRooms(hotelId, search, status, roomType, minPrice, maxPrice, sortBy, sortDirection);
	}
	
	@GetMapping("/room/{roomId}")
	private ResponseEntity<?> getRoomByRoomId(@PathVariable long roomId){
		return roomService.getRoomByRoomId(roomId);
	}

	@DeleteMapping("/rooms/{roomId}")
	private ResponseEntity<?> deleteRoomById(@PathVariable long roomId){
		return roomService.deteleRoomById(roomId);
	}
	
	@PatchMapping("/rooms/{roomId}")
	public ResponseEntity<?> updateRoomById(
			@PathVariable Long roomId,
			@RequestPart("room") String roomJson,
			@RequestPart(value = "images", required = false) List<MultipartFile> roomImages
	) throws IOException {
		return roomService.updateRoomById(roomId, roomJson, roomImages);
	}

}
