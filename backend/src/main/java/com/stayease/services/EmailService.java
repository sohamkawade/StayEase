package com.stayease.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.support.email}")
    private String fromEmail;

    @Value("${app.name}")
    private String appName;

    public void sendOTPEmail(String toEmail, String otp) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("🔐 " + appName + " - Password Reset OTP");

            String htmlContent = """
                    <div style="font-family: 'Segoe UI', sans-serif; color: #333; background: #f9fafb; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #1d4ed8; text-align: center;">%s</h2>
                        <p style="font-size: 15px;">Hi there 👋,</p>
                        <p style="font-size: 15px;">
                            Use the following <b style="color: #1d4ed8;">OTP</b> to reset your password:
                        </p>
                        <div style="background: #1d4ed8; color: #fff; font-size: 24px; letter-spacing: 4px; padding: 10px 0; border-radius: 8px; text-align: center; margin: 15px 0;">
                            <b>%s</b>
                        </div>
                        <p style="font-size: 14px; color: #555;">
                            ⚠️ This OTP is valid for <b>10 minutes</b> only.<br>
                            If you didn’t request this, please ignore this message.
                        </p>
                        <p style="font-size: 14px; margin-top: 20px; color: #1e40af; text-align: center;">
                            — The %s Support Team 🏨
                        </p>
                    </div>
                    """.formatted(appName, otp, appName);

            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);

            System.out.println("✅ OTP email sent successfully to " + toEmail);

        } catch (MessagingException e) {
            System.err.println("Error sending OTP email: " + e.getMessage());
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    public void sendEmailToGuest(String toEmail, String guestName, String subject, String body) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);

            String htmlContent = """
                    <div style="font-family: 'Segoe UI', sans-serif; color: #333; background: #f9fafb; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #1d4ed8; text-align: center;">%s</h2>
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
                            <p style="font-size: 15px; white-space: pre-line;">%s</p>
                        </div>
                        <p style="font-size: 14px; margin-top: 20px; color: #1e40af; text-align: center;">
                            — The %s Team 🏨
                        </p>
                    </div>
                    """.formatted(subject, body.replace("\n", "<br>"), appName);

            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);


        } catch (MessagingException e) {
            System.err.println("Error sending email: " + e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }

    public void sendThankYouEmail(String toEmail, String firstName) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Thank You for Contacting StayEase");

            String htmlContent = """
                    <div style="font-family: 'Segoe UI', sans-serif; color: #333; background: #f9fafb; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #1d4ed8; text-align: center;">Thank You for Contacting StayEase</h2>
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
                            <p style="font-size: 15px;">Dear %s,</p>
                            <p style="font-size: 15px;">Thank you for reaching out to StayEase! Our team has received your message and will get back to you soon.</p>
                            <p style="font-size: 15px;">We appreciate your interest and look forward to assisting you.</p>
                        </div>
                        <p style="font-size: 14px; margin-top: 20px; color: #1e40af; text-align: center;">
                            — The %s Support Team 🏨
                        </p>
                    </div>
                    """.formatted(firstName, appName);

            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);

        } catch (MessagingException e) {
            System.err.println("Error sending thank you email: " + e.getMessage());
        }
    }

    public void sendBookingConfirmationEmail(String toEmail, String guestName, String hotelName, String roomNumber, 
                                             String roomType, String checkInDate, String checkOutDate, 
                                             String transactionId, double totalAmount, int totalGuests) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("✅ Booking Confirmed - " + appName);

            String htmlContent = """
                    <div style="font-family: 'Segoe UI', sans-serif; color: #333; background: #f9fafb; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #1d4ed8; text-align: center;">✅ Booking Confirmed</h2>
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
                            <p style="font-size: 15px;">Dear %s,</p>
                            <p style="font-size: 15px; margin-top: 15px;"><strong>Your booking has been confirmed!</strong></p>
                            
                            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
                                <p style="margin: 8px 0;"><strong>Hotel:</strong> %s</p>
                                <p style="margin: 8px 0;"><strong>Room:</strong> %s (%s)</p>
                                <p style="margin: 8px 0;"><strong>Guests:</strong> %d</p>
                                <p style="margin: 8px 0;"><strong>Check-in:</strong> %s (2:00 PM)</p>
                                <p style="margin: 8px 0;"><strong>Check-out:</strong> %s (11:00 AM)</p>
                                <p style="margin: 8px 0;"><strong>Amount:</strong> ₹%.2f</p>
                            </div>
                            
                            <p style="font-size: 14px; color: #555; margin-top: 15px;">
                                Please bring a valid ID proof during check-in.
                            </p>
                        </div>
                        <p style="font-size: 14px; margin-top: 20px; color: #1e40af; text-align: center;">
                            — The %s Team 🏨
                        </p>
                    </div>
                    """.formatted(guestName, hotelName, roomNumber, roomType, totalGuests, 
                                 checkInDate, checkOutDate, totalAmount, transactionId, appName);

            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);

        } catch (MessagingException e) {
            System.err.println("Error sending booking confirmation email: " + e.getMessage());
        }
    }

    public void sendBookingCancellationEmail(String toEmail, String guestName, String hotelName, 
                                             String transactionId, String checkInDate, 
                                             String checkOutDate, double totalAmount) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Booking Cancelled - " + appName);

            String htmlContent = """
                    <div style="font-family: 'Segoe UI', sans-serif; color: #333; background: #f9fafb; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #dc2626; text-align: center;">Booking Cancelled</h2>
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
                            <p style="font-size: 15px;">Dear %s,</p>
                            <p style="font-size: 15px; margin-top: 15px;">Your booking has been <strong>cancelled successfully</strong>.</p>
                            
                            <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #dc2626;">
                                <p style="margin: 8px 0;"><strong>Hotel:</strong> %s</p>
                                <p style="margin: 8px 0;"><strong>Check-in:</strong> %s</p>
                                <p style="margin: 8px 0;"><strong>Check-out:</strong> %s</p>
                                <p style="margin: 8px 0;"><strong>Amount:</strong> ₹%.2f</p>
                            </div>
                            
                            <p style="font-size: 14px; color: #555; margin-top: 15px;">
                                Refund will be processed as per our cancellation policy.
                            </p>
                        </div>
                        <p style="font-size: 14px; margin-top: 20px; color: #1e40af; text-align: center;">
                            — The %s Team 🏨
                        </p>
                    </div>
                    """.formatted(guestName, hotelName, checkInDate, checkOutDate, totalAmount, transactionId, appName);

            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);

        } catch (MessagingException e) {
            System.err.println("Error sending booking cancellation email: " + e.getMessage());
        }
    }
}
