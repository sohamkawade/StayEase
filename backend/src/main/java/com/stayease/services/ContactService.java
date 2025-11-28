package com.stayease.services;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.stayease.MyResponseWrapper;
import com.stayease.models.Contact;
import com.stayease.repositories.ContactRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ContactService {

	private final ContactRepository contactRepository;
	private final MyResponseWrapper responseWrapper;
	private final EmailService emailService;

	public ResponseEntity<?> sendMessage(Contact contact) {
		Contact savedContact = contactRepository.save(contact);
		try {
			emailService.sendThankYouEmail(contact.getEmail(), contact.getFirstname());
		} catch (Exception e) {
			System.err.println("Failed to send thank you email: " + e.getMessage());
		}
		return universalResponse("Message sent successfully", savedContact, HttpStatus.OK);
	}

	public ResponseEntity<?> getAllMessages() {
		List<Contact> getAllMessages = contactRepository.findAll();
		if (getAllMessages.size() == 0) {
			return universalResponse("There is no any message", null, HttpStatus.NOT_FOUND);
		} else {
			return universalResponse("Following messages found", getAllMessages, HttpStatus.FOUND);

		}
	}

	public ResponseEntity<?> deleteMessage(long id) {
		Optional<Contact> existingContact = contactRepository.findById(id);
		if (existingContact.isPresent()) {
			contactRepository.delete(existingContact.get());
			return universalResponse("Message deleted successfully", null, HttpStatus.OK);
		} else {
			return universalResponse("There is no message with id:" + id, null, HttpStatus.NOT_FOUND);
		}
	}

	private ResponseEntity<?> universalResponse(String message, Object data, HttpStatus httpStatus) {
		responseWrapper.setMessage(message);
		responseWrapper.setData(data);
		return new ResponseEntity<>(responseWrapper, httpStatus);
	}
}
