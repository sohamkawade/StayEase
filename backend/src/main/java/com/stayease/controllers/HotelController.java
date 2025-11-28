package com.stayease.controllers;

import java.io.IOException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
 import com.stayease.dto.ChangePasswordRequest;
import com.stayease.models.HotelManager;
import com.stayease.services.HotelService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class HotelController {

    private final HotelService hotelService;

    @PostMapping("/hotels/add")
    public ResponseEntity<?> addHotel(
            @RequestPart("hotel") String hotelJson,
            @RequestPart(value = "image", required = false) MultipartFile hotelImage
    ) throws IOException {
        return hotelService.addHotel(hotelJson, hotelImage);
    }

    @GetMapping("/hotels")
    ResponseEntity<?> getFilteredHotels(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDirection
    ){
    	return hotelService.getFilteredHotels(search, status, location, sortBy, sortDirection);
    }
    
    @GetMapping("/hotels/{hotelId}")
    ResponseEntity<?> getHotelById(@PathVariable long hotelId){
    	return hotelService.getHotelById(hotelId);
    }
    
    @GetMapping("/manager/{managerId}")
    ResponseEntity<?> getMangaerById(@PathVariable long managerId){
    	return hotelService.getMangaerById(managerId);
    }
    
    @PatchMapping("/hotels/{hotelId}")
    public ResponseEntity<?> updateHotel(
            @PathVariable Long hotelId,
            @RequestPart("hotel") String hotelJson,
            @RequestPart(value = "image", required = false) MultipartFile hotelImage
    ) throws IOException {
        return hotelService.updateHotel(hotelId, hotelJson, hotelImage);
    }

    @PatchMapping("/manager/{managerId}")
    public ResponseEntity<?> updateManager(
            @PathVariable Long managerId,
            @RequestBody HotelManager manager
    ) {
        return hotelService.updateManager(manager, managerId);
    }

    @PutMapping("/manager/{managerId}/password")
    public ResponseEntity<?> changeManagerPassword(
            @PathVariable Long managerId,
            @RequestBody ChangePasswordRequest request
    ) {
        return hotelService.changeManagerPassword(request, managerId);
    }

    @DeleteMapping("/hotels/{hotelId}")
    public ResponseEntity<?> deleteHotel(@PathVariable Long hotelId) {
        return hotelService.deleteHotel(hotelId);
    }

}