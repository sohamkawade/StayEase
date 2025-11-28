package com.stayease.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stayease.services.WishListService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class WishListController {
	private final WishListService wishListService;
	
	@PostMapping("/add-to-wishlist/{userId}/{roomId}")
	private ResponseEntity<?> addToWishList(@PathVariable long userId,@PathVariable long roomId){
		return wishListService.addToWishList(userId, roomId);
	}
	
	@GetMapping("/get-wishlist/{userId}")
	private ResponseEntity<?> getUserWishlist(@PathVariable long userId){
		return wishListService.getUserWishlist(userId);
	}
	
	@DeleteMapping("/remove-wishlist/{wishListId}")
	ResponseEntity<?> removeFromWishlist(@PathVariable long wishListId){
		return wishListService.removeFromWishlist(wishListId);
	}
}
