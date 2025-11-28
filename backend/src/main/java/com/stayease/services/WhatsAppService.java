package com.stayease.services;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.stayease.models.AppUser;
import com.stayease.models.Booking;
import com.stayease.models.Hotel;
import com.stayease.models.Room;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WhatsAppService {

	private final RestTemplate restTemplate;

	@Value("${whatsapp.server.url:http://localhost:5000}")
	private String whatsappServerUrl;

	public void sendBookingConfirmation(Booking booking, AppUser user, Hotel hotel, Room room) {
		try {
			String phoneNumber = formatPhoneNumber(user.getContactNumber());
			String message = createBookingMessage(booking, user, hotel, room);
			sendMessage(phoneNumber, message);
		} catch (Exception e) {
			System.err.println("Failed to send WhatsApp message: " + e.getMessage());
		}
	}

	public void sendHotelWelcome(Hotel hotel) {
		try {
			String phoneNumber = formatPhoneNumber(hotel.getContactNumber());
			String message = createHotelWelcomeMessage(hotel);
			sendMessage(phoneNumber, message);
		} catch (Exception e) {
			System.err.println("Failed to send WhatsApp welcome: " + e.getMessage());
		}
	}


	private void sendMessage(String phoneNumber, String message) {
		try {
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_JSON);

			Map<String, String> requestBody = new HashMap<>();
			requestBody.put("phone", phoneNumber);
			requestBody.put("message", message);

			HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);
			String url = whatsappServerUrl + "/send-message";
			var response = restTemplate.postForEntity(url, request, Map.class);
			System.out.println("WhatsApp send-message status: " + response.getStatusCode());
		} catch (Exception e) {
			System.err.println("Error sending WhatsApp message: " + e.getMessage());
		}
	}

	private String formatPhoneNumber(String contactNumber) {
		String cleaned = contactNumber == null ? "" : contactNumber.replaceAll("[^0-9]", "");
		if (cleaned.isEmpty()) return cleaned;
		if (cleaned.startsWith("91") && cleaned.length() == 12) {
			return "+" + cleaned;
		}
		if (cleaned.length() == 10) {
			return "+91" + cleaned;
		}
		if (cleaned.length() == 11 && cleaned.startsWith("0")) {
			return "+91" + cleaned.substring(1);
		}
		return cleaned.startsWith("+") ? cleaned : "+" + cleaned;
	}

	private String createBookingMessage(Booking booking, AppUser user, Hotel hotel, Room room) {
		DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
		String checkInDate = booking.getCheckInDate().format(dateFormatter);
		String checkOutDate = booking.getCheckOutDate().format(dateFormatter);
	
		StringBuilder message = new StringBuilder();
	
		message.append("🏨 *StayEase Booking Confirmation*\n\n");
		message.append("Dear ").append(user.getFirstname()).append(" ").append(user.getLastname()).append(",\n\n");
		message.append("✅ Your booking has been *successfully confirmed!*\n\n");
	
		message.append("📍 *Hotel:* ").append(hotel.getHotelName()).append("\n");
		if (hotel.getAddress() != null) {
			message.append("🏠 *Address:* ").append(formatAddress(hotel.getAddress())).append("\n");
		}
		message.append("📞 *Contact:* ").append(hotel.getContactNumber()).append("\n\n");
	
		message.append("🛏 *Room Details:*\n");
		message.append("• Room No: ").append(room.getRoomNumber()).append("\n");
		message.append("• Type: ").append(room.getRoomType()).append("\n");
		message.append("• Guests: ").append(booking.getTotalGuests()).append("\n");
		message.append("• 💰 Amount: ₹").append(String.format("%.2f", booking.getTotalAmount())).append("\n\n");
	
		message.append("📅 *Stay Details:*\n");
		message.append("• Check-in: ").append(checkInDate).append(" (2:00 PM)\n");
		message.append("• Check-out: ").append(checkOutDate).append(" (11:00 AM)\n\n");
	
		message.append("🪪 Please bring a valid *ID proof* during check-in.\n\n");
		message.append("❤️ *Thank you for choosing StayEase!*\n");
	
		return message.toString();
	}	

	private String createHotelWelcomeMessage(Hotel hotel) {
		StringBuilder message = new StringBuilder();
		message.append("🏨 *Welcome to StayEase*\n\n");
		message.append("Hi ").append(hotel.getHotelName()).append(",\n\n");
		message.append("Your hotel has been successfully added.\n");
		message.append("We\'re excited to have you on board!\n\n");
		if (hotel.getManager() != null) {
			message.append("👤 *Assigned Manager*\n");
			message.append("• Name: ")
				.append(nullSafe(hotel.getManager().getFirstname())).append(" ")
				.append(nullSafe(hotel.getManager().getLastname())).append("\n");
			if (hotel.getManager().getEmail() != null) {
				message.append("• Email: ").append(hotel.getManager().getEmail()).append("\n");
			}
			if (hotel.getManager().getContactNumber() != null) {
				message.append("• Phone: ").append(hotel.getManager().getContactNumber()).append("\n");
			}
			message.append("\n");
		}
		message.append("You can now manage rooms, bookings, and guests in your dashboard.\n\n");
		message.append("— Team StayEase");
		return message.toString();
	}


	private String nullSafe(String v) { return v == null ? "" : v; }

	private String formatAddress(com.stayease.models.Address address) {
		StringBuilder addr = new StringBuilder();
		if (address.getStreetAddress() != null && !address.getStreetAddress().isEmpty()) {
			addr.append(address.getStreetAddress());
		}
		if (address.getCity() != null && !address.getCity().isEmpty()) {
			if (addr.length() > 0)
				addr.append(", ");
			addr.append(address.getCity());
		}
		if (address.getState() != null && !address.getState().isEmpty()) {
			if (addr.length() > 0)
				addr.append(", ");
			addr.append(address.getState());
		}
		if (address.getPincode() != null && !address.getPincode().isEmpty()) {
			if (addr.length() > 0)
				addr.append(" - ");
			addr.append(address.getPincode());
		}
		return addr.toString();
	}
}
