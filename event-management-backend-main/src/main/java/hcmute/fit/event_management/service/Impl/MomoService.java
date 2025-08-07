package hcmute.fit.event_management.service.Impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import hcmute.fit.event_management.config.MomoAPI;
import hcmute.fit.event_management.config.MomoConfig;

import hcmute.fit.event_management.dto.CheckoutDTO;
import hcmute.fit.event_management.dto.MomoRequestPayment;
import hcmute.fit.event_management.dto.TransactionDTO;
import hcmute.fit.event_management.entity.*;
import hcmute.fit.event_management.repository.*;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import static hcmute.fit.event_management.util.PaymentUtil.*;

@Service
@Slf4j
@AllArgsConstructor
public class MomoService {

    @Autowired
    MomoConfig momoConfig;
    @Autowired
    BookingRepository bookingRepository;
    @Autowired
    TransactionRepository transactionRepository;
    @Autowired
    UserRepository userRepository;
    @Autowired
    TicketRepository ticketRepository;
    @Autowired
    BookingDetailsRepository bookingDetailsRepository;

    private final MomoAPI momoAPI;
    @Autowired
    private EventRepository eventRepository;
    @Autowired
    private CheckInTicketRepository checkInTicketRepository;
    @Autowired
    EmailServiceImpl emailService;

    public ResponseEntity<?> createQRCode(CheckoutDTO checkoutDTO) {
        try {
            // 1. Khởi tạo các biến cần thiết
            String partnerCode = momoConfig.getPartnerCode();
            String accessKey = momoConfig.getAccessKey();
            String redirectUrl = momoConfig.getRedirectUrl();
            String ipnUrl = momoConfig.getIpnUrl();
            String requestType = momoConfig.getRequestType();
            String secretKey = momoConfig.getSecretKey();

            String orderId = String.valueOf(System.currentTimeMillis());
            String requestId = UUID.randomUUID().toString();
            String orderInfo = checkoutDTO.getOrderInfo();
            int amount = (int) checkoutDTO.getAmount();

            // 2. Tạo chuỗi rawHash và chữ ký
            String rawHash = String.format("accessKey=%s&amount=%d&extraData=%s&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=%s",
                    accessKey, amount, orderInfo, ipnUrl, orderId, orderInfo, partnerCode, redirectUrl, requestId, requestType);
            String signature = hmacSHA256(secretKey, rawHash);

            // 3. Tạo đối tượng request gửi đến MoMo
            MomoRequestPayment request = MomoRequestPayment.builder()
                    .partnerCode(partnerCode)
                    .requestType(requestType)
                    .ipnUrl(ipnUrl)
                    .redirectUrl(redirectUrl)
                    .orderId(orderId)
                    .orderInfo(orderInfo)
                    .requestId(requestId)
                    .amount(amount)
                    .extraData(orderInfo)
                    .signature(signature)
                    .lang("vi")
                    .build();

            ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
            ZonedDateTime now = ZonedDateTime.now(zoneId);
            ZonedDateTime expireDate = now.plusMinutes(100);
            // 5. Tạo Booking và lưu vào DB
            Booking booking = new Booking();
            booking.setBookingCode(orderId);
            booking.setBookingMethod("Momo");
            booking.setBookingStatus("Pending");
            booking.setTotalPrice(amount);
            booking.setCreateDate(java.util.Date.from(now.toInstant()));
            booking.setExpireDate(java.util.Date.from(expireDate.toInstant()));

            Event event = eventRepository.findById(checkoutDTO.getEventId()).orElseThrow(() -> new RuntimeException("Event not found"));
            User user = userRepository.findById(checkoutDTO.getUserId()).orElseThrow(() -> new RuntimeException("User not found"));
            booking.setEvent(event);
            booking.setUser(user);

            bookingRepository.saveAndFlush(booking);

            // 6. Tạo BookingDetails cho từng vé
            for (Map.Entry<Integer, Integer> entry : checkoutDTO.getTickets().entrySet()) {
                Ticket ticket = ticketRepository.findById(entry.getKey()).orElseThrow(() -> new RuntimeException("Ticket not found"));
                BookingDetails details = new BookingDetails();
                details.setBooking(booking);
                details.setTicket(ticket);
                details.setQuantity(entry.getValue());
                details.setPrice(entry.getValue() * ticket.getPrice());
                bookingDetailsRepository.save(details);
            }
            ResponseEntity<?> response = momoAPI.createMomoQR(request);
            log.info("MoMo API response: Status={}, Body={}", response.getStatusCode(), response.getBody());
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() instanceof Map) {
                Map<String, Object> momoResponse = (Map<String, Object>) response.getBody();
                String payUrl = (String) momoResponse.get("payUrl");
                if (payUrl != null) {
                    return ResponseEntity.ok(Collections.singletonMap("payUrl", payUrl));
                } else {
                    log.error("MoMo response missing payUrl: {}", momoResponse);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body("Invalid MoMo response: missing payUrl");
                }
            } else {
                log.error("Invalid MoMo API response: Status={}, Body={}", response.getStatusCode(), response.getBody());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to create MoMo QR code: " + response.getBody());
            }


        } catch (Exception e) {
            log.error("Failed to create MoMo QR code: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating MoMo QR code: " + e.getMessage());
        }
    }

    public void ipn(Map<String, String> payload) throws Exception {
        String partnerCode = momoConfig.getPartnerCode();
        String accessKey = momoConfig.getAccessKey();
        String secretKey = momoConfig.getSecretKey();

        String orderId = payload.get("orderId");
        Optional<Booking> optionalBooking = bookingRepository.findByBookingCode(orderId);
        if (optionalBooking.isEmpty()) return;

        Booking booking = optionalBooking.get();
        if ("PAID".equalsIgnoreCase(booking.getBookingStatus())) return;

        String rawHash = String.format(
                "accessKey=%s&amount=%s&extraData=%s&message=%s&orderId=%s&orderInfo=%s" +
                        "&orderType=%s&partnerCode=%s&payType=%s&requestId=%s&responseTime=%s&resultCode=%s&transId=%s",
                accessKey,
                payload.get("amount"),
                payload.get("extraData"),
                payload.get("message"),
                orderId,
                payload.get("orderInfo"),
                payload.get("orderType"),
                partnerCode,
                payload.get("payType"),
                payload.get("requestId"),
                payload.get("responseTime"),
                payload.get("resultCode"),
                payload.get("transId")
        );

        String generatedSignature = hmacSHA256(secretKey, rawHash);
        if (!generatedSignature.equals(payload.get("signature"))) {
            booking.setBookingStatus("FAILED");
            bookingRepository.save(booking);
            return;
        }

        boolean isPaymentSuccess = "0".equals(payload.get("resultCode"));
        booking.setBookingStatus(isPaymentSuccess ? "PAID" : "FAILED");
        bookingRepository.save(booking);

        if (!isPaymentSuccess) return;

        // Cập nhật số lượng vé
        List<Ticket> updatedTickets = booking.getBookingDetails().stream().map(detail -> {
            Ticket ticket = detail.getTicket();
            ticket.setSold(ticket.getSold() + detail.getQuantity());
            return ticket;
        }).collect(Collectors.toList());

        ticketRepository.saveAll(updatedTickets);

        // Lưu giao dịch
        Transaction transaction = new Transaction();
        transaction.setBooking(booking);
        transaction.setTransactionInfo(payload.get("extraData"));
        transaction.setMessage(payload.get("message"));
        transaction.setPaymentMethod("MOMO");
        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        ZonedDateTime now = ZonedDateTime.now(zoneId);
        String payDate = now.format(formatter);
        transaction.setTransactionDate(payDate);
        transaction.setTransactionAmount(Double.parseDouble(payload.get("amount")));
        transaction.setTransactionStatus("SUCCESSFULLY");
        transaction.setReferenceCode(payload.get("transId"));
        transactionRepository.save(transaction);
        List<BookingDetails> bkdts = booking.getBookingDetails();
        List<CheckInTicket> tickets = new ArrayList<>();
        for (BookingDetails bkdt : bkdts) {
            for (int i = 0; i < bkdt.getQuantity(); i++) {
                CheckInTicket ticket = new CheckInTicket();
                ticket.setStatus(0);
                ticket.setTicketCode(UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase());
                ticket.setBookingDetails(bkdt);
                tickets.add(ticket);
            }
        }
        checkInTicketRepository.saveAll(tickets);
        emailService.sendThanksPaymentEmail(booking.getUser().getEmail(), booking.getEvent().getEventName(), booking.getBookingCode(), booking.getUser().getFullName(), tickets);
    }

    public ResponseEntity<?> refund(TransactionDTO transactionDTO) {
        try {
            // 1. Lấy thông tin cấu hình
            String partnerCode = momoConfig.getPartnerCode();
            String accessKey = momoConfig.getAccessKey();
            String secretKey = momoConfig.getSecretKey();

            // 2. Kiểm tra giao dịch tồn tại
            Optional<Transaction> optionalTransaction = transactionRepository.findByOrderCode(transactionDTO.getReferenceCode());
            if (optionalTransaction.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Transaction not found");
            }
            Transaction transaction = optionalTransaction.get();
            Optional<Booking> optionalBooking = bookingRepository.findByBookingCode(transaction.getBooking().getBookingCode());
            if (optionalBooking.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Booking not found");
            }
            Booking booking = optionalBooking.get();
            if (!"PAID".equalsIgnoreCase(booking.getBookingStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Booking is not in PAID status");
            }

            // 3. Tạo requestId và orderId cho refund
            String requestId = UUID.randomUUID().toString();
            String orderId = booking.getBookingCode();
            int amount = (int) transaction.getTransactionAmount();
            String transId = transaction.getReferenceCode();

            // 4. Tạo chuỗi rawHash và chữ ký cho refund
            String rawHash = String.format("accessKey=%s&amount=%d&orderId=%s&partnerCode=%s&requestId=%s&transId=%s",
                    accessKey, amount, orderId, partnerCode, requestId, transId);
            String signature = hmacSHA256(secretKey, rawHash);

            // 5. Tạo đối tượng request cho refund
            MomoRequestPayment request = MomoRequestPayment.builder()
                    .partnerCode(partnerCode)
                    .orderId(orderId)
                    .requestId(requestId)
                    .amount(amount)
                    .transId(transId)
                    .signature(signature)
                    .lang("vi")
                    .build();

            // 6. Gọi API refund
            ResponseEntity<?> response = momoAPI.refund(request);
            // 7. Xử lý phản hồi từ MoMo
            if (response.getStatusCode().is2xxSuccessful()) {
                // Cập nhật trạng thái booking và transaction
                booking.setBookingStatus("REFUNDED");
                bookingRepository.save(booking);
                transaction.setTransactionStatus("REFUNDED");
                transactionRepository.save(transaction);

                // Hoàn lại số lượng vé
                List<Ticket> updatedTickets = booking.getBookingDetails().stream().map(detail -> {
                    Ticket ticket = detail.getTicket();
                    ticket.setSold(ticket.getSold() - detail.getQuantity());
                    return ticket;
                }).collect(Collectors.toList());
                ticketRepository.saveAll(updatedTickets);

                return ResponseEntity.ok("Refund successful");
            } else {
                log.error("Refund failed: {}", response.getBody());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Refund failed: " + response.getBody());
            }

        } catch (Exception e) {
            log.error("Failed to process refund: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing refund");
        }
    }
}
