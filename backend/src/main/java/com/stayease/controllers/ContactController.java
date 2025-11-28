package com.stayease.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stayease.models.Contact;
import com.stayease.services.ContactService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class ContactController {
	private final ContactService contactService;
	
	@PostMapping("/send-message")
	private ResponseEntity<?> sendMessage(@RequestBody Contact contact) {
		return contactService.sendMessage(contact);
	}
	
	@GetMapping("/get-messages")
	private ResponseEntity<?> getAllMessages() {
		return contactService.getAllMessages();
	}
	
	@DeleteMapping("message/{id}")
	private ResponseEntity<?> deleteMessage(@PathVariable long id) {
		return contactService.deleteMessage(id);
	}
}
