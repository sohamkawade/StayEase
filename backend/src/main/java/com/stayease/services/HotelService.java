package com.stayease.services;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stayease.MyResponseWrapper;
import com.stayease.models.Address;
import com.stayease.dto.ChangePasswordRequest;
import com.stayease.models.Hotel;
import com.stayease.models.HotelManager;
import com.stayease.enums.Role;
import com.stayease.repositories.HotelManagerRepository;
import com.stayease.repositories.HotelRepository;
import com.stayease.specifications.HotelSpecification;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;

@Service
@RequiredArgsConstructor
public class HotelService {

	private final HotelRepository hotelRepository;
	private final HotelManagerRepository hotelManagerRepository;
	private final MyResponseWrapper responseWrapper;
	private final PasswordEncoder passwordEncoder;
	private final WhatsAppService whatsAppService;
	private final CloudinaryService cloudinaryService;

	@Transactional
	public ResponseEntity<?> addHotel(String hotelObjectStringify, MultipartFile hotelImage) throws IOException {
		ObjectMapper objectMapper = new ObjectMapper();
		Hotel hotel = objectMapper.readValue(hotelObjectStringify, Hotel.class);
		HotelManager hotelManager = hotel.getManager();
		String encodedPassword = passwordEncoder.encode(hotelManager.getPassword());
		hotelManager.setPassword(encodedPassword);
		hotelManager.setRole(Role.HOTEL_MANAGER);
		HotelManager savedHotelManager = hotelManagerRepository.save(hotelManager);
		hotel.setManager(savedHotelManager);

		if (hotelImage != null && !hotelImage.isEmpty()) {
			String imageUrl = cloudinaryService.uploadImage(hotelImage, "stayease/hotels");
			if (imageUrl != null && !imageUrl.isEmpty()) {
				hotel.setHotelImage(imageUrl);
			}
		}

		Hotel savedHotel = hotelRepository.save(hotel);
		try {
			if (savedHotel.getContactNumber() != null && !savedHotel.getContactNumber().isEmpty()) {
				whatsAppService.sendHotelWelcome(savedHotel);
			}
		} catch (Exception ignored) {
		}
		return universalResponse("Hotel added successfully", savedHotel, HttpStatus.OK);
	}

	@Transactional
	public ResponseEntity<?> updateHotel(long hotelId, String hotelObjectStringify, MultipartFile hotelImage)
			throws IOException {
		Optional<Hotel> existingHotel = hotelRepository.findById(hotelId);
		if (existingHotel.isEmpty()) {
			return universalResponse("Hotel not found with id: " + hotelId, null, HttpStatus.NOT_FOUND);
		}

		ObjectMapper objectMapper = new ObjectMapper();
		objectMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		Hotel hotel = objectMapper.readValue(hotelObjectStringify, Hotel.class);
		Hotel persisted = existingHotel.get();

		if (hotelImage != null && !hotelImage.isEmpty()) {
			String imageUrl = cloudinaryService.uploadImage(hotelImage, "stayease/hotels");
			if (imageUrl != null && !imageUrl.isEmpty()) {
				persisted.setHotelImage(imageUrl);
			}
		}

		if (hotel.getHotelName() != null) {
			persisted.setHotelName(hotel.getHotelName());
		}
		if (hotel.getEmail() != null) {
			persisted.setEmail(hotel.getEmail());
		}
		if (hotel.getContactNumber() != null) {
			persisted.setContactNumber(hotel.getContactNumber());
		}
		if (hotel.getDescription() != null) {
			persisted.setDescription(hotel.getDescription());
		}
		if (hotel.getStarRating() != null) {
			persisted.setStarRating(hotel.getStarRating());
		}
		if (hotel.getStatus() != null) {
			persisted.setStatus(hotel.getStatus());
		}

		if (hotel.getAddress() != null) {
			if (persisted.getAddress() != null) {
				Address existingAddress = persisted.getAddress();
				if (hotel.getAddress().getStreetAddress() != null) {
					existingAddress.setStreetAddress(hotel.getAddress().getStreetAddress());
				}
				if (hotel.getAddress().getCity() != null) {
					existingAddress.setCity(hotel.getAddress().getCity());
				}
				if (hotel.getAddress().getState() != null) {
					existingAddress.setState(hotel.getAddress().getState());
				}
				if (hotel.getAddress().getPincode() != null) {
					existingAddress.setPincode(hotel.getAddress().getPincode());
				}
			} else {
				Address newAddress = hotel.getAddress();
				newAddress.setId(null);
				persisted.setAddress(newAddress);
			}
		}

		Hotel savedHotel = hotelRepository.save(persisted);
		return universalResponse("Hotel updated successfully!", savedHotel, HttpStatus.OK);
	}

	public ResponseEntity<?> getHotelById(long hotelId) {
		Optional<Hotel> existingHotel = hotelRepository.findById(hotelId);
		if (existingHotel.isPresent()) {
			return universalResponse("Hotel found", existingHotel.get(), HttpStatus.OK);
		} else {
			return universalResponse("Hotel not found with id:" + hotelId, null, HttpStatus.NOT_FOUND);
		}
	}

	@Transactional
	public ResponseEntity<?> getFilteredHotels(String search, String status, String location,
			String sortBy, String sortDirection) {
		Specification<Hotel> allFilters = null;
		
		if (search != null && !search.isEmpty()) {
			allFilters = HotelSpecification.searchInAllFields(search);
		} else if (location != null && !location.isEmpty()) {
			allFilters = HotelSpecification.searchInAllFields(location);
		}
		
		Specification<Hotel> statusSpec = HotelSpecification.hasStatus(status);
		if (statusSpec != null) {
			allFilters = allFilters == null ? statusSpec : allFilters.and(statusSpec);
		}

		if (sortBy != null && sortDirection != null) {
			if ("name".equalsIgnoreCase(sortBy) || "hotelname".equalsIgnoreCase(sortBy)) {
				Specification<Hotel> sortSpec = HotelSpecification.sortByHotelName(sortDirection);
				allFilters = allFilters == null ? sortSpec : allFilters.and(sortSpec);
			}
		}

		List<Hotel> filteredHotels = allFilters == null ? hotelRepository.findAll() : hotelRepository.findAll(allFilters);
		return universalResponse("Following filtered hotels found", filteredHotels, HttpStatus.OK);
	}

	public ResponseEntity<?> getMangaerById(long managerId) {
		Optional<HotelManager> existingManager = hotelManagerRepository.findById(managerId);
		if (existingManager.isPresent()) {
			return universalResponse("Manager found", existingManager.get(), HttpStatus.OK);
		} else {
			return universalResponse("Manager not found with id:" + managerId, null, HttpStatus.NOT_FOUND);
		}
	}

	@Transactional
	public ResponseEntity<?> updateManager(HotelManager manager, long managerId) {
		Optional<HotelManager> existingManager = hotelManagerRepository.findById(managerId);
		if (existingManager.isPresent()) {
			HotelManager updateManager = existingManager.get();
			updateManager.setFirstname(manager.getFirstname());
			updateManager.setLastname(manager.getLastname());
			updateManager.setEmail(manager.getEmail());
			updateManager.setContactNumber(manager.getContactNumber());
			HotelManager savedManager = hotelManagerRepository.save(updateManager);
			return universalResponse("Manager updated successfully!", savedManager, HttpStatus.OK);
		} else {
			return universalResponse("Manager not found with id: " + managerId, null, HttpStatus.NOT_FOUND);
		}
	}

	@Transactional
	public ResponseEntity<?> changeManagerPassword(ChangePasswordRequest request, long managerId) {
		Optional<HotelManager> existingManager = hotelManagerRepository.findById(managerId);
		if (existingManager.isPresent()) {
			HotelManager manager = existingManager.get();
			if (!passwordEncoder.matches(request.getCurrentPassword(), manager.getPassword())) {
				return universalResponse("Current password is incorrect", null, HttpStatus.BAD_REQUEST);
			}
			String encodedPassword = passwordEncoder.encode(request.getNewPassword());
			manager.setPassword(encodedPassword);
			hotelManagerRepository.save(manager);
			return universalResponse("Password changed successfully", null, HttpStatus.OK);
		} else {
			return universalResponse("Manager not found with id: " + managerId, null, HttpStatus.NOT_FOUND);
		}
	}

	@Transactional
	public ResponseEntity<?> deleteHotel(long hotelId) {
		Optional<Hotel> existingHotel = hotelRepository.findById(hotelId);
		if (existingHotel.isPresent()) {
			hotelRepository.delete(existingHotel.get());
			return universalResponse("Hotel deleted successfully", null, HttpStatus.OK);
		} else {
			return universalResponse("Hotel not found with id: " + hotelId, null, HttpStatus.NOT_FOUND);
		}
	}

	private ResponseEntity<?> universalResponse(String message, Object data, HttpStatus httpStatus) {
		responseWrapper.setMessage(message);
		responseWrapper.setData(data);
		return new ResponseEntity<>(responseWrapper, httpStatus);
	}
}
