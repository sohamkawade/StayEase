package com.stayease.services;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.stayease.MyResponseWrapper;
import com.stayease.models.AppUser;
import com.stayease.models.Room;
import com.stayease.models.WishList;
import com.stayease.repositories.AppUserRepository;
import com.stayease.repositories.RoomRepository;
import com.stayease.repositories.WishListRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WishListService {

	private final WishListRepository wishListRepository;
	private final AppUserRepository appUserRepository;
	private final RoomRepository roomRepository;
	private final MyResponseWrapper responseWrapper;

	public ResponseEntity<?> addToWishList(Long userId, Long roomId) {
		Optional<AppUser> user = appUserRepository.findById(userId);
		Optional<Room> room = roomRepository.findById(roomId);
		if (user.isPresent() && room.isPresent()) {
			AppUser existingUser = user.get();
			Room existingRoom = room.get();
			WishList wishList = new WishList();
			wishList.setUser(existingUser);
			wishList.setRoom(existingRoom);
			wishListRepository.save(wishList);
			return universalResponse("Room added to wishlist successfully!", wishList, HttpStatus.OK);
		} else {
			return universalResponse("User or Room not found!", null, HttpStatus.NOT_FOUND);
		}
	}

	public ResponseEntity<?> getUserWishlist(long userId) {
		List<WishList> wishlist = wishListRepository.findByUser_Id(userId);
		if (wishlist.isEmpty()) {
			return universalResponse("No wishlist items found for this user.", wishlist, HttpStatus.NOT_FOUND);
		}
		return universalResponse("Following wishlist items found for this user", wishlist, HttpStatus.OK);
	}
	
	public ResponseEntity<?> removeFromWishlist(long wishListId) {
       boolean wishlist = wishListRepository.existsById(wishListId);
       if(wishlist) {
    	   wishListRepository.deleteById(wishListId);
			return universalResponse("Room removed from wishlist!", wishlist, HttpStatus.OK);

       } else{
			return universalResponse("Wishlist item not found!", null, HttpStatus.NOT_FOUND);
       }
    }

	private ResponseEntity<?> universalResponse(String message, Object data, HttpStatus httpStatus) {
		responseWrapper.setMessage(message);
		responseWrapper.setData(data);
		return new ResponseEntity<>(responseWrapper, httpStatus);
	}
}
