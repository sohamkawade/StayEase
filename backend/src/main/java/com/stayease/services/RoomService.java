package com.stayease.services;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.DeserializationFeature;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.stayease.MyResponseWrapper;
import com.stayease.models.Booking;
import com.stayease.enums.BookingStatus;
import com.stayease.models.Hotel;
import com.stayease.models.Room;
import com.stayease.models.RoomImage;
import com.stayease.enums.RoomStatus;
import com.stayease.repositories.BookingRepository;
import com.stayease.repositories.HotelRepository;
import com.stayease.repositories.RoomRepository;
import com.stayease.specifications.RoomSpecification;
import org.springframework.data.jpa.domain.Specification;
import org.hibernate.Hibernate;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RoomService {
	private final RoomRepository roomRepository;
	private final HotelRepository hotelRepository;
	private final BookingRepository bookingRepository;
	private final MyResponseWrapper responseWrapper;
	private final CloudinaryService cloudinaryService;
	
	
	@Transactional
	public ResponseEntity<?> addRoom(long hotelId, String roomObjectStringify, List<MultipartFile> roomImages) throws IOException {
		try {
			Optional<Hotel> existingHotel = hotelRepository.findById(hotelId);
			if (!existingHotel.isPresent()) {
				return universalResponse("Hotel Not Found with id:" + hotelId, null, HttpStatus.NOT_FOUND);
			}

			ObjectMapper objectMapper = new ObjectMapper();
			objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			Room room = objectMapper.readValue(roomObjectStringify, Room.class);
			Hotel hotel = existingHotel.get();

			if (room.getRoomNumber() != null && roomRepository.existsByHotelIdAndRoomNumber(hotelId, room.getRoomNumber())) {
				return universalResponse("Room number '" + room.getRoomNumber() + "' already exists for this hotel", null, HttpStatus.CONFLICT);
			}

			room.setHotel(hotel);
			if (room.getStatus() == null) {
				room.setStatus(RoomStatus.AVAILABLE);
			}

			if (roomImages != null && !roomImages.isEmpty()) {
				if (room.getImages() == null) {
					room.setImages(new java.util.ArrayList<>());
				}
				for (MultipartFile roomImage : roomImages) {
					if (roomImage != null && !roomImage.isEmpty()) {
						try {
							String imageUrl = cloudinaryService.uploadImage(roomImage, "stayease/rooms");
							if (imageUrl != null && !imageUrl.isEmpty()) {
								RoomImage roomImageEntity = new RoomImage();
								roomImageEntity.setImageUrl(imageUrl);
								roomImageEntity.setRoom(room);
								room.getImages().add(roomImageEntity);
							}
						} catch (Exception e) {
						}
					}
				}
			}

			Room savedRoom = roomRepository.save(room);
			return universalResponse("Room added successfully!", savedRoom, HttpStatus.OK);
		} catch (Exception e) {
			String errorMessage = "Error adding room: " + e.getMessage();
			if (e.getCause() != null) {
				errorMessage += " - Cause: " + e.getCause().getMessage();
			}
			return universalResponse(errorMessage, null, HttpStatus.BAD_REQUEST);
		}
	}

	

	@Transactional
	public ResponseEntity<?> getAllRoomsByHotelId(long hotelId) {
		Optional<Hotel> existingHotel = hotelRepository.findById(hotelId);
		if (!existingHotel.isPresent()) {
			return universalResponse("Hotel Not Found with id:" + hotelId, null, HttpStatus.NOT_FOUND);
		}
		List<Room> rooms = roomRepository.findByHotelIdWithImages(hotelId);
		if (rooms == null || rooms.isEmpty()) {
			return universalResponse("No rooms found for this hotel", new java.util.ArrayList<>(), HttpStatus.OK);
		}
		for (Room room : rooms) {
			Hibernate.initialize(room.getImages());
			Hibernate.initialize(room.getAmenities());
			syncRoomStatus(room);
		}
		return universalResponse("Rooms found", rooms, HttpStatus.OK);
	}

	@Transactional
	public ResponseEntity<?> getFilteredRooms(long hotelId, String search, String status, String roomType, Double minPrice,
			Double maxPrice, String sortBy, String sortDirection) {
		Optional<Hotel> existingHotel = hotelRepository.findById(hotelId);
		if (!existingHotel.isPresent()) {
			return universalResponse("Hotel Not Found with id:" + hotelId, null, HttpStatus.NOT_FOUND);
		}

		Specification<Room> allFilters = null;
		
		Specification<Room> hotelIdSpec = RoomSpecification.hasHotelId(hotelId);
		allFilters = hotelIdSpec;
		
		Specification<Room> searchSpec = RoomSpecification.roomNumberContains(search);
		if (searchSpec != null) {
			allFilters = allFilters.and(searchSpec);
		}
		
		Specification<Room> statusSpec = RoomSpecification.hasStatusString(status);
		if (statusSpec != null) {
			allFilters = allFilters.and(statusSpec);
		}
		
		Specification<Room> roomTypeSpec = RoomSpecification.hasRoomType(roomType);
		if (roomTypeSpec != null) {
			allFilters = allFilters.and(roomTypeSpec);
		}
		
		Specification<Room> priceSpec = RoomSpecification.priceBetween(minPrice, maxPrice);
		if (priceSpec != null) {
			allFilters = allFilters.and(priceSpec);
		}

		if (sortBy != null && sortDirection != null && "price".equalsIgnoreCase(sortBy)) {
			Specification<Room> sortSpec = RoomSpecification.sortByPrice(sortDirection);
			allFilters = allFilters.and(sortSpec);
		}

		List<Room> filteredRooms = roomRepository.findAll(allFilters);
		
		for (Room room : filteredRooms) {
			Hibernate.initialize(room.getImages());
			Hibernate.initialize(room.getAmenities());
			syncRoomStatus(room);
		}
		return universalResponse("Following filtered rooms found", filteredRooms, HttpStatus.OK);
	}

	@Transactional
	public ResponseEntity<?> getRoomByRoomId(long roomId) {
		Optional<Room> existingRoom = roomRepository.findById(roomId);
		if (existingRoom.isPresent()) {
			Room room = existingRoom.get();
			Hibernate.initialize(room.getImages());
			Hibernate.initialize(room.getAmenities());
			syncRoomStatus(room);
			return universalResponse("Room found", room, HttpStatus.FOUND);
		} else {
			return universalResponse("Room not found with id:" + roomId, null, HttpStatus.NOT_FOUND);
		}
	}
	
	private void syncRoomStatus(Room room) {
		if (room.getStatus() == RoomStatus.MAINTENANCE) {
			return;
		}
		
		List<Booking> bookings = bookingRepository.findByRoomId(room.getId());
		if (bookings == null || bookings.isEmpty()) {
			if (room.getStatus() != RoomStatus.AVAILABLE) {
				room.setStatus(RoomStatus.AVAILABLE);
				roomRepository.save(room);
			}
			return;
		}
		
		boolean hasActiveBooking = false;
		for (Booking booking : bookings) {
			BookingStatus status = booking.getBookingStatus();
			if (status == BookingStatus.PENDING || 
			    status == BookingStatus.CONFIRMED || 
			    status == BookingStatus.CHECKED_IN || 
			    status == BookingStatus.CHECKED_OUT) {
				hasActiveBooking = true;
				break;
			}
		}
		
		if (hasActiveBooking) {
			if (room.getStatus() != RoomStatus.BOOKED) {
				room.setStatus(RoomStatus.BOOKED);
				roomRepository.save(room);
			}
		} else {
			if (room.getStatus() != RoomStatus.AVAILABLE) {
				room.setStatus(RoomStatus.AVAILABLE);
				roomRepository.save(room);
			}
		}
	}
	

	@Transactional
	public ResponseEntity<?> deteleRoomById(long roomId) {
		Optional<Room> existingRoom = roomRepository.findById(roomId);
		if (existingRoom.isPresent()) {
			roomRepository.delete(existingRoom.get());
			return universalResponse("Room deleted successfully", null, HttpStatus.OK);
		}
		return universalResponse("Room Not Found with id:" + roomId, null, HttpStatus.NOT_FOUND);
	}
	
	@Transactional
	public ResponseEntity<?> updateRoomById(long roomId, String roomObjectStringify, List<MultipartFile> roomImages) throws IOException {
		Optional<Room> existingRoom = roomRepository.findById(roomId);
		if (existingRoom.isEmpty()) {
			return universalResponse("Room not found with id: " + roomId, null, HttpStatus.NOT_FOUND);
		}

		ObjectMapper objectMapper = new ObjectMapper();
		objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		Room room = objectMapper.readValue(roomObjectStringify, Room.class);
		Room persisted = existingRoom.get();


		if (roomImages != null && !roomImages.isEmpty()) {
			if (persisted.getImages() == null) {
				persisted.setImages(new java.util.ArrayList<>());
			}
				for (MultipartFile roomImage : roomImages) {
					if (roomImage != null && !roomImage.isEmpty()) {
						try {
							String imageUrl = cloudinaryService.uploadImage(roomImage, "stayease/rooms");
							if (imageUrl != null && !imageUrl.isEmpty()) {
								RoomImage roomImageEntity = new RoomImage();
								roomImageEntity.setImageUrl(imageUrl);
								roomImageEntity.setRoom(persisted);
								persisted.getImages().add(roomImageEntity);
							}
						} catch (Exception e) {
						}
					}
				}
		}

		persisted.setRoomNumber(room.getRoomNumber());
		persisted.setRoomType(room.getRoomType());
		if (room.getPrice() > 0) {
			persisted.setPrice(room.getPrice());
		}
		if (room.getStatus() != null) {
			persisted.setStatus(room.getStatus());
		}
		persisted.setCapacity(room.getCapacity());
		persisted.setBedType(room.getBedType());
		persisted.setViewType(room.getViewType());
		persisted.setDescription(room.getDescription());
		persisted.setAmenities(room.getAmenities());

		Room savedRoom = roomRepository.save(persisted);
		return universalResponse("Room updated successfully!", savedRoom, HttpStatus.OK);
	}

	private ResponseEntity<?> universalResponse(String message, Object data, HttpStatus httpStatus) {
		responseWrapper.setMessage(message);
		responseWrapper.setData(data);
		return new ResponseEntity<>(responseWrapper, httpStatus);
	}
}
