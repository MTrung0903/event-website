package hcmute.fit.event_management.service.Impl;


import hcmute.fit.event_management.config.VNPAYAPI;
import hcmute.fit.event_management.config.VNPAYConfig;
import hcmute.fit.event_management.dto.CheckoutDTO;

import hcmute.fit.event_management.dto.RefundDTO;
import hcmute.fit.event_management.dto.VNPAYRefund;
import hcmute.fit.event_management.entity.*;

import hcmute.fit.event_management.repository.*;

import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import payload.Response;



import java.net.URLDecoder;
import java.net.URLEncoder;



import java.nio.charset.StandardCharsets;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

import java.util.*;
import java.util.stream.Collectors;

import static hcmute.fit.event_management.util.PaymentUtil.*;

@Service
@Slf4j
@AllArgsConstructor
public class VNPAYService {

    @Autowired
    VNPAYConfig vnPayConfig;

    @Autowired
    BookingRepository bookingRepository;

    @Autowired
    BookingDetailsRepository bookingDetailsRepository;

    @Autowired
    UserRepository userRepository;
    @Autowired
    TicketRepository ticketRepository;
    @Autowired
    TransactionRepository transactionRepository;
    @Autowired
    EmailServiceImpl emailService;
    public static final Map<String, String> errorMessages = new HashMap<>();
    static {
        errorMessages.put("07", "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).");
        errorMessages.put("09", "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.");
        errorMessages.put("10", "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.");
        errorMessages.put("11", "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.");
        errorMessages.put("12", "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.");
        errorMessages.put("13", "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.");
        errorMessages.put("24", "Giao dịch không thành công do: Khách hàng hủy giao dịch.");
        errorMessages.put("51", "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.");
        errorMessages.put("65", "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.");
        errorMessages.put("75", "Ngân hàng thanh toán đang bảo trì.");
        errorMessages.put("79", "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch.");
        errorMessages.put("99", "Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê).");
    }
    private final VNPAYAPI vnpayapi;
    @Autowired
    private RefundRepository refundRepository;
    @Autowired
    private EventRepository eventRepository;
    @Autowired
    private CheckInTicketRepository checkInTicketRepository;


    public String createPaymentUrl(HttpServletRequest req, CheckoutDTO checkoutDTO) throws Exception {
        String vnp_TxnRef = String.valueOf(System.currentTimeMillis());
        String vnp_OrderInfo = checkoutDTO.getOrderInfo();
        String encodedInfo = URLEncoder.encode(vnp_OrderInfo, StandardCharsets.UTF_8);
        System.out.println("<<<<<<<<<<<<<" + vnp_OrderInfo + ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        String vnp_OrderType = "other";
        String vnp_Amount = String.valueOf(checkoutDTO.getAmount() * 100L); // Nhân 100 để ra đơn vị tiền nhỏ nhất (VND)
        String vnp_Locale = "vn";
        String vnp_ReturnUrl = vnPayConfig.getReturnUrl();
        String vnp_IpAddr = getIpAddress(req);
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        vnp_Params.put("vnp_Amount", vnp_Amount);
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", encodedInfo);
        vnp_Params.put("vnp_OrderType", vnp_OrderType);
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
        vnp_Params.put("vnp_Locale", vnp_Locale);

        // Sử dụng ZonedDateTime với múi giờ Asia/Ho_Chi_Minh
        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        ZonedDateTime now = ZonedDateTime.now(zoneId);
        String vnp_CreateDate = now.format(formatter);
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        // Tính thời gian hết hạn (15 phút sau)
        ZonedDateTime expireDate = now.plusMinutes(15);
        String vnp_ExpireDate = expireDate.format(formatter);
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        String queryUrl = getPaymentURL(vnp_Params, true);
        String hashData = getPaymentURL(vnp_Params, false);
        String vnpSecureHash = hmacSHA512(vnPayConfig.getSecretKey(), hashData);
        queryUrl += "&vnp_SecureHash=" + vnpSecureHash;

        // Lưu vào booking với status pending
        try {
            Booking booking = new Booking();
            Event event = eventRepository.findById(checkoutDTO.getEventId()).orElse(new Event());
            User user = userRepository.findById(checkoutDTO.getUserId()).orElse(new User());
            // Chuyển đổi ZonedDateTime sang java.util.Date để lưu vào entity
            booking.setCreateDate(java.util.Date.from(now.toInstant()));
            booking.setExpireDate(java.util.Date.from(expireDate.toInstant()));
            booking.setBookingCode(vnp_TxnRef);
            booking.setBookingMethod("VNPAY");
            booking.setBookingStatus("Pending");
            booking.setTotalPrice(checkoutDTO.getAmount());
            booking.setUser(user);
            booking.setEvent(event);
            bookingRepository.saveAndFlush(booking);
            for (Integer ticketId : checkoutDTO.getTickets().keySet()) {
                BookingDetails bkdt = new BookingDetails();
                bkdt.setBooking(booking);
                Ticket ticket = ticketRepository.findById(ticketId).orElse(new Ticket());
                bkdt.setTicket(ticket);
                bkdt.setQuantity(checkoutDTO.getTickets().get(ticketId));
                bkdt.setPrice(ticket.getPrice() * checkoutDTO.getTickets().get(ticketId));
                bookingDetailsRepository.save(bkdt);
            }
        } catch (Exception e) {
            System.out.println(">>>>>>>>>>>>>>" + e);
        }
        return vnPayConfig.getPayUrl() + "?" + queryUrl;
    }
    public void ipn(HttpServletRequest request) throws Exception {
        Map<String, String> fields = new HashMap<>();
        Enumeration<String> params = request.getParameterNames();
        while (params.hasMoreElements()) {
            String rawField = params.nextElement();
            String value = request.getParameter(rawField);
            if (value != null && !value.isEmpty()) {
                fields.put(URLEncoder.encode(rawField, StandardCharsets.US_ASCII), URLEncoder.encode(value, StandardCharsets.US_ASCII));
            }
        }

        String vnp_SecureHash = request.getParameter("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");

        String computedHash = hashAllFields(vnPayConfig.getSecretKey(), fields);
        String txnRef = request.getParameter("vnp_TxnRef");
        String info = URLDecoder.decode(request.getParameter("vnp_OrderInfo"), StandardCharsets.UTF_8);
        String responseCode = request.getParameter("vnp_ResponseCode");
        String message = request.getParameter(responseCode);
        String transactionNo = request.getParameter("vnp_TransactionNo");
        Optional<Booking> optionalBooking = bookingRepository.findByBookingCode(txnRef);
        if (optionalBooking.isEmpty()) return;

        Booking booking = optionalBooking.get();

        if (!computedHash.equals(vnp_SecureHash)) {
            updateBookingStatus(booking, "FAILED");
            return;
        }

        if ("PAID".equals(booking.getBookingStatus())) return;

        if ("00".equals(responseCode)) {
            List<Ticket> ticketsToUpdate = booking.getBookingDetails().stream()
                    .map(details -> {
                        Ticket ticket = details.getTicket();
                        ticket.setSold(ticket.getSold() + details.getQuantity());
                        return ticket;
                    })
                    .collect(Collectors.toList());

            ticketRepository.saveAll(ticketsToUpdate);
            updateBookingStatus(booking, "PAID");
            Transaction transaction = new Transaction();
            transaction.setTransactionNo(transactionNo);
            transaction.setBooking(booking);
            transaction.setTransactionInfo(info);
            transaction.setMessage(message);
            transaction.setPaymentMethod("VNPAY");
            transaction.setTransactionDate(request.getParameter("vnp_PayDate"));
            transaction.setTransactionAmount(Double.parseDouble(request.getParameter("vnp_Amount")) / 100);
            transaction.setTransactionStatus("SUCCESSFULLY");
            transaction.setReferenceCode(txnRef);
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
            emailService.sendThanksPaymentEmail(booking.getUser().getEmail(), booking.getEvent().getEventName(), booking.getBookingCode(), booking.getUser().getFullName(),tickets);
        } else {
            updateBookingStatus(booking, "FAILED");
        }
    }

    private void updateBookingStatus(Booking booking, String status) {
        booking.setBookingStatus(status);
        bookingRepository.save(booking);
    }

    public ResponseEntity<?> refund(HttpServletRequest req, Transaction transaction) throws Exception {
        Response responseEntity = new Response();
        final long refundAmount = (long) (transaction.getTransactionAmount() * 100);
        final String vnp_RequestId = UUID.randomUUID().toString();
        final String vnp_CreateDate = DateTimeFormatter.ofPattern("yyyyMMddHHmmss").format(LocalDateTime.now());
        final String vnp_IpAddr = getIpAddress(req);
        final String vnp_TxnRef = transaction.getReferenceCode();
        final String vnp_OrderInfo = "Refund order " + transaction.getReferenceCode();
        final String vnp_TransactionNo = transaction.getTransactionNo();
        final String vnp_TransactionDate = transaction.getTransactionDate();
        Map<String, String> params = Map.ofEntries(
                Map.entry("vnp_RequestId", vnp_RequestId),
                Map.entry("vnp_Version", "2.1.0"),
                Map.entry("vnp_Command", "refund"),
                Map.entry("vnp_TmnCode", vnPayConfig.getTmnCode()),
                Map.entry("vnp_TransactionType", "02"),
                Map.entry("vnp_TxnRef", vnp_TxnRef),
                Map.entry("vnp_Amount", String.valueOf(refundAmount)),
                Map.entry("vnp_TransactionNo", vnp_TransactionNo),
                Map.entry("vnp_TransactionDate", vnp_TransactionDate),
                Map.entry("vnp_CreateBy", "admin"),
                Map.entry("vnp_CreateDate", vnp_CreateDate),
                Map.entry("vnp_IpAddr", vnp_IpAddr),
                Map.entry("vnp_OrderInfo", vnp_OrderInfo)
        );

        String hashData = buildRawData(params);
        String secureHash = hmacSHA512(vnPayConfig.getSecretKey(), hashData);
        params = new HashMap<>(params);
        params.put("vnp_SecureHash", secureHash);

        VNPAYRefund request = VNPAYRefund.builder()
                .vnp_RequestId(vnp_RequestId)
                .vnp_Version("2.1.0")
                .vnp_Command("refund")
                .vnp_TmnCode(vnPayConfig.getTmnCode())
                .vnp_TransactionType("02")
                .vnp_TxnRef(vnp_TxnRef)
                .vnp_Amount(refundAmount)
                .vnp_OrderInfo(vnp_OrderInfo)
                .vnp_TransactionNo(vnp_TransactionNo)
                .vnp_TransactionDate(vnp_TransactionDate)
                .vnp_CreateBy("admin")
                .vnp_CreateDate(vnp_CreateDate)
                .vnp_IpAddr(vnp_IpAddr)
                .vnp_SecureHash(secureHash)
                .build();

        ResponseEntity<?> response = vnpayapi.refundVNPAY(request);
        Refund refund = new Refund();
        RefundDTO refundDTO = new RefundDTO();

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() instanceof Map<?, ?> body) {
            String responseCode = (String) body.get("vnp_ResponseCode");
            String message = (String) body.get("vnp_Message");

            refund.setResponseCode(responseCode);
            refund.setMessage(message);
            refund.setRefundAmount(refundAmount);
            refund.setRequestDate(transaction.getTransactionDate());
            refund.setTransaction(transaction);

            if ("00".equals(responseCode)) {
                transaction.setTransactionStatus("REFUNDED");
                refund.setStatus("SUCCESSFULLY");
                responseEntity.setStatusCode(1);
                responseEntity.setMsg("SUCCESSFULLY");
                transactionRepository.save(transaction);
                Booking booking = transaction.getBooking();
                booking.setBookingStatus("CANCELED");
                bookingRepository.save(booking);
                List<Ticket> updatedTickets = booking.getBookingDetails().stream().map(detail -> {
                    Ticket ticket = detail.getTicket();
                    ticket.setSold(ticket.getSold() - detail.getQuantity());
                    return ticket;
                }).collect(Collectors.toList());
                ticketRepository.saveAll(updatedTickets);
                List<BookingDetails> bkts = booking.getBookingDetails();
                for (BookingDetails bookingDetails : bkts) {
                    List<CheckInTicket> tickets = bookingDetails.getCheckInTickets();
                    for (CheckInTicket checkInTicket : tickets) {
                        checkInTicket.setStatus(-1);
                    }
                    checkInTicketRepository.saveAll(tickets);
                }
            } else {
                refund.setStatus("FAILED");
                responseEntity.setStatusCode(0);
                responseEntity.setMsg("FAILED");
            }
            refundRepository.save(refund);
        }
        BeanUtils.copyProperties(refund, refundDTO);
        responseEntity.setData(refundDTO);
        return ResponseEntity.ok(responseEntity);
    }
}

