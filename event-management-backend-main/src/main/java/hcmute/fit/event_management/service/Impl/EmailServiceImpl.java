package hcmute.fit.event_management.service.Impl;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.qrcode.QRCodeWriter;
import hcmute.fit.event_management.entity.CheckInTicket;
import hcmute.fit.event_management.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Random;
import java.util.List;

import static org.unbescape.html.HtmlEscape.escapeHtml4;

@Slf4j
@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public void sendResetEmail(String to, String resetToken) {
        String subject = "Yêu cầu đặt lại mật khẩu";
        String resetUrl = "http://localhost:3000/reset-password?token=" + resetToken;
        String htmlContent = "<!DOCTYPE html>" +
                "<html lang='vi'>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<title>Đặt lại mật khẩu</title>" +
                "<style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }" +
                ".container { max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px; }" +
                "h2 { color: #2c3e50; }" +
                "a { color: #3498db; text-decoration: none; }" +
                "a:hover { text-decoration: underline; }" +
                ".button { display: inline-block; padding: 10px 20px; background: #3498db; color: white; border-radius: 5px; text-align: center; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<h2>Đặt lại mật khẩu</h2>" +
                "<p>Kính gửi Quý khách,</p>" +
                "<p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng nhấp vào nút dưới đây để đặt lại mật khẩu:</p>" +
                "<p><a href='" + resetUrl + "' class='button'>Đặt lại mật khẩu</a></p>" +
                "<p>Nếu bạn không thực hiện yêu cầu này, xin vui lòng bỏ qua email này.</p>" +
                "<p>Nếu cần hỗ trợ, vui lòng liên hệ qua email: <a href='mailto:tungvladgod@gmail.com'>support@eventmanagement.com</a>.</p>" +
                "<p>Trân trọng,<br>Đội ngũ Event Management</p>" +
                "</div>" +
                "</body>" +
                "</html>";

        sendHtmlEmail(to, subject, htmlContent);
    }

    @Override
    public void sendThanksPaymentEmail(String to, String eventName, String orderCode, String userName, List<CheckInTicket> tickets) throws Exception {
        if (to == null || !to.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            log.error("Invalid email address: {}", to);
            throw new IllegalArgumentException("Invalid email address");
        }
        if (tickets == null || tickets.isEmpty()) {
            log.error("Ticket list is empty or null for order: {}", orderCode);
            throw new IllegalArgumentException("Ticket list cannot be empty");
        }
        String safeUserName = userName != null && !userName.trim().isEmpty() ? escapeHtml4(userName) : "Customer";
        String safeEventName = escapeHtml4(eventName);

        StringBuilder content = new StringBuilder();
        content.append("<!DOCTYPE html>")
                .append("<html lang=\"en\">")
                .append("<head>")
                .append("<meta charset=\"UTF-8\">")
                .append("<title>Event Tickets</title>")
                .append("<style>")
                .append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }")
                .append(".container { max-width: 600px; margin: 0 auto; padding: 20px; }")
                .append("h1 { color: #1a73e8; }")
                .append(".ticket-info { margin: 20px 0; }")
                .append("table { width: 100%; border-collapse: collapse; }")
                .append("td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }")
                .append("th { background-color: #f2f2f2; }")
                .append(".button { display: inline-block; padding: 10px 20px; background-color: #1a73e8; color: #fff; text-decoration: none; border-radius: 4px; }")
                .append(".footer { margin-top: 20px; font-size: 12px; color: #777; }")
                .append("</style>")
                .append("</head>")
                .append("<body>")
                .append("<div class=\"container\">")
                .append("<h1>Thank You for Your Purchase!</h1>")
                .append("<p>Dear ").append(safeUserName).append(",</p>")
                .append("<p>Thank you for purchasing tickets to <strong>").append(safeEventName).append("</strong>. We are excited to have you join us!</p>")
                .append("<h2>Your Ticket Details</h2>")
                .append("<div class=\"ticket-info\">")
                .append("<table>")
                .append("<tr>")
                .append("<th>Ticket Code</th>")
                .append("<th>Event</th>")
                .append("<th>Date</th>")
                .append("<th>Location</th>")
                .append("<th>Price</th>")
                .append("</tr>");

        String qrUrl = "http://localhost:3000/view-tickets/" + orderCode;
        for (CheckInTicket ticket : tickets) {
            try {
                content.append("<tr>")
                        .append("<td>").append(escapeHtml4(ticket.getTicketCode())).append("</td>")
                        .append("<td>").append(safeEventName).append("</td>")
                        .append("<td>").append(escapeHtml4(ticket.getBookingDetails().getTicket().getEvent().getEventStart().toString())).append("</td>")
                        .append("<td>")
                        .append(escapeHtml4(ticket.getBookingDetails().getTicket().getEvent().getEventLocation().getVenueName())).append(", ")
                        .append(escapeHtml4(ticket.getBookingDetails().getTicket().getEvent().getEventLocation().getAddress())).append(", ")
                        .append(escapeHtml4(ticket.getBookingDetails().getTicket().getEvent().getEventLocation().getCity()))
                        .append("</td>")
                        .append("<td>").append(String.format("%.2f", ticket.getBookingDetails().getTicket().getPrice())).append(" VND</td>")
                        .append("</tr>");
            } catch (Exception e) {
                log.error("Error processing ticket {}: {}", ticket.getTicketCode(), e.getMessage(), e);
            }
        }

        content.append("</table>")
                .append("</div>")
                .append("<p>You can view your tickets online by clicking the button below:</p>")
                .append("<p><a href=\"").append(escapeHtml4(qrUrl)).append("\" class=\"button\">View Your Tickets</a></p>")
                .append("<p>Please find your ticket QR codes attached to this email for check-in at the event.</p>")
                .append("<p>We look forward to seeing you at ").append(safeEventName).append("!</p>")
                .append("<p>Best regards,<br>The EventSync Team</p>")
                .append("<div class=\"footer\">")
                .append("<p>If you have any questions, please contact us at <a href=\"mailto:support@eventsync.com\">support@eventsync.com</a>.</p>")
                .append("</div>")
                .append("</div>")
                .append("</body>")
                .append("</html>");

        String subject = "Your Event Tickets – " + safeEventName;
        sendHtmlEmail(to, subject, content.toString(), tickets);
    }

    public void sendHtmlEmail(String to, String subject, String htmlContent, List<CheckInTicket> tickets) throws MessagingException {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom("tungvladgod@gmail.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            if (tickets != null) {
                for (CheckInTicket ticket : tickets) {
                    try {
                        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
                        MatrixToImageWriter.writeToStream(
                                new QRCodeWriter().encode(ticket.getTicketCode(), BarcodeFormat.QR_CODE, 200, 200),
                                "PNG", pngOutputStream
                        );
                        helper.addAttachment(ticket.getTicketCode() + ".png", new ByteArrayResource(pngOutputStream.toByteArray()));
                    } catch (WriterException | IOException e) {
                        log.error("Error attaching QR code for ticket {}: {}", ticket.getTicketCode(), e.getMessage(), e);
                    }
                }
            }
            mimeMessage.setHeader("Content-Transfer-Encoding", "base64");
            mailSender.send(mimeMessage);
            log.info("Email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Error sending email to {}: {}", to, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    @Override
    public String sendVerificationCode(String email) throws MessagingException {
        String code = String.format("%06d", new Random().nextInt(999999));
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8"); // Enable HTML content
        helper.setTo(email);
        helper.setSubject("Mã Xác Minh Đăng Ký Tài Khoản");

        // Nội dung email được định dạng bằng HTML
        String htmlContent = "<!DOCTYPE html>" +
                "<html>" +
                "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>" +
                "<h2 style='color: #2c3e50;'>Xác Minh Đăng Ký Tài Khoản</h2>" +
                "<p>Kính gửi Quý khách,</p>" +
                "<p>Cảm ơn bạn đã đăng ký tài khoản tại hệ thống của chúng tôi. Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã xác minh dưới đây:</p>" +
                "<div style='background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;'>" +
                "<h3 style='color: #e74c3c; margin: 0;'>Mã xác minh: " + code + "</h3>" +
                "</div>" +
                "<p>Vui lòng nhập mã này vào trang xác minh trên website của chúng tôi để kích hoạt tài khoản </p>" +
                "<p><strong>Lưu ý:</strong> Vui lòng không chia sẻ mã xác minh này với bất kỳ ai để đảm bảo an toàn cho tài khoản của bạn.</p>" +
                "<p>Nếu bạn không thực hiện yêu cầu này, xin vui lòng bỏ qua email này.</p>" +
                "<p>Nếu cần hỗ trợ, vui lòng liên hệ với chúng tôi qua email: <a href='mailto:\n" +
                "tungvladgod@gmail.com' style='color: #3498db;'>support@eventmanagement.com</a>.</p>" +
                "<p>Trân trọng,<br>Đội ngũ Event Management</p>" +
                "<hr style='border-top: 1px solid #eee;'>" +
                "<p style='font-size: 12px; color: #777;'>Đây là email tự động, vui lòng không trả lời trực tiếp. Nếu cần hỗ trợ, liên hệ qua email hỗ trợ ở trên.</p>" +
                "</body>" +
                "</html>";

        helper.setText(htmlContent, true); // true để bật chế độ HTML
        mailSender.send(message);
        return code;
    }
    @Override
    public void sendNewEventNotification(String to, String eventName, String eventStart, String eventLocation, String eventUrl) throws MessagingException {
        String safeEventName = escapeHtml4(eventName);
        String subject = "Sự kiện mới: " + safeEventName;

        String htmlContent = "<!DOCTYPE html>" +
                "<html lang='vi'>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<title>Thông báo sự kiện mới</title>" +
                "<style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }" +
                ".container { max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px; }" +
                "h2 { color: #2c3e50; }" +
                "a { color: #3498db; text-decoration: none; }" +
                "a:hover { text-decoration: underline; }" +
                ".button { display: inline-block; padding: 10px 20px; background: #3498db; color: white; border-radius: 5px; text-align: center; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<h2>Thông báo sự kiện mới</h2>" +
                "<p>Kính gửi Quý khách,</p>" +
                "<p>Chúng tôi rất vui thông báo rằng một sự kiện mới vừa được tạo: <strong>" + safeEventName + "</strong>.</p>" +
                "<p><strong>Thời gian:</strong> " + eventStart + "</p>" +
                "<p><strong>Địa điểm:</strong> " + eventLocation + "</p>" +
                "<p>Hãy tham gia ngay để không bỏ lỡ sự kiện thú vị này!</p>" +
                "<p><a href='" + eventUrl + "' class='button'>Xem chi tiết sự kiện</a></p>" +
                "<p>Nếu cần hỗ trợ, vui lòng liên hệ qua email: <a href='mailto:tungvladgod@gmail.com'>support@eventmanagement.com</a>.</p>" +
                "<p>Trân trọng,<br>Đội ngũ Event Management</p>" +
                "</div>" +
                "</body>" +
                "</html>";

        sendHtmlEmail(to, subject, htmlContent);
    }

}