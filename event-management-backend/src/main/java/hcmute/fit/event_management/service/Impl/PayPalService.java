package hcmute.fit.event_management.service.Impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import hcmute.fit.event_management.config.PayPalAPI;
import hcmute.fit.event_management.dto.CheckoutDTO;
import hcmute.fit.event_management.dto.RefundDTO;
import hcmute.fit.event_management.entity.*;
import hcmute.fit.event_management.repository.*;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import payload.Response;

import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PayPalService {

    private static final Logger LOGGER = LoggerFactory.getLogger(PayPalService.class);
    @Autowired
    private RefundRepository refundRepository;
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
    @Autowired
    private EventRepository eventRepository;
    @Autowired
    private CheckInTicketRepository checkInTicketRepository;
    @Autowired
    EmailServiceImpl emailService;
    @Autowired
    private PayPalAPI payPalAPI;



    @Value("${paypal.api.base-url}")
    private String baseUrl;
    private static final double DEFAULT_EXCHANGE_RATE = 26030.0;
    public Double getRealTimeExchangeRate() throws Exception {
        String primaryUrl = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json";
        String fallbackUrl = "https://open.er-api.com/v6/latest/USD"; // API dự phòng
        RestTemplate restTemplate = new RestTemplate();
        ObjectMapper objectMapper = new ObjectMapper();

        // Thử API chính (Currency-API)
        try {
            ResponseEntity<String> rawResponse = restTemplate.getForEntity(primaryUrl, String.class);
            LOGGER.info("Primary API Response Status: {}, Content-Type: {}, Body: {}",
                    rawResponse.getStatusCode(),
                    rawResponse.getHeaders().getContentType(),
                    rawResponse.getBody());

            if (rawResponse.getStatusCode().is2xxSuccessful() &&
                    rawResponse.getHeaders().getContentType() != null &&
                    rawResponse.getHeaders().getContentType().toString().contains("application/json")) {
                Map<String, Object> responseBody = objectMapper.readValue(rawResponse.getBody(), Map.class);

                if (responseBody != null && responseBody.containsKey("vnd")) {
                    return ((Number) responseBody.get("vnd")).doubleValue();
                } else {
                    LOGGER.error("Primary API returned null or empty rates: {}", rawResponse.getBody());
                    throw new RuntimeException("Primary API returned null or empty rates");
                }
            } else {
                LOGGER.error("Primary API failed: Status={}, Content-Type={}, Body={}",
                        rawResponse.getStatusCode(), rawResponse.getHeaders().getContentType(), rawResponse.getBody());
                throw new RuntimeException("Primary API failed");
            }
        } catch (Exception e) {
            LOGGER.warn("Primary API failed: {}, trying fallback API", e.getMessage());

            // Thử API dự phòng (ExchangeRate-API)
            try {
                ResponseEntity<String> rawResponse = restTemplate.getForEntity(fallbackUrl, String.class);
                LOGGER.info("Fallback API Response Status: {}, Content-Type: {}, Body: {}",
                        rawResponse.getStatusCode(),
                        rawResponse.getHeaders().getContentType(),
                        rawResponse.getBody());

                if (rawResponse.getStatusCode().is2xxSuccessful() &&
                        rawResponse.getHeaders().getContentType() != null &&
                        rawResponse.getHeaders().getContentType().toString().contains("application/json")) {
                    Map<String, Object> responseBody = objectMapper.readValue(rawResponse.getBody(), Map.class);
                    Map<String, Object> rates = (Map<String, Object>) responseBody.get("rates");

                    if (rates != null && rates.containsKey("VND")) {
                        return ((Number) rates.get("VND")).doubleValue();
                    } else {
                        LOGGER.error("Fallback API returned null or empty rates: {}", rawResponse.getBody());
                        throw new RuntimeException("Fallback API returned null or empty rates");
                    }
                } else {
                    LOGGER.error("Fallback API failed: Status={}, Content-Type={}, Body={}",
                            rawResponse.getStatusCode(), rawResponse.getHeaders().getContentType(), rawResponse.getBody());
                    throw new RuntimeException("Fallback API failed");
                }
            } catch (Exception ex) {
                LOGGER.error("Fallback API failed: {}", ex.getMessage());

                return DEFAULT_EXCHANGE_RATE;
            }
        }
    }
    public String getAccessToken() throws Exception {
        String body = "grant_type=client_credentials";
        LOGGER.info("Requesting PayPal access token");
        ResponseEntity<Map<String, Object>> response = payPalAPI.getAccessToken(body);
        if (response.getStatusCode().is2xxSuccessful()) {
            String token = (String) Objects.requireNonNull(response.getBody()).get("access_token");
            LOGGER.info("Access token retrieved: {}", token.substring(0, 10) + "...");
            return token;
        } else {
            LOGGER.error("Failed to get PayPal access token: {}", response.getBody());
            throw new RuntimeException("Failed to get PayPal access token: " + response.getBody());
        }
    }

    public Map<String, Object> createPayment(CheckoutDTO checkoutDTO, String currency, String cancelUrl, String successUrl) throws Exception {
        double amount = checkoutDTO.getAmount();
        double unit = getRealTimeExchangeRate();
        DecimalFormat df = new DecimalFormat("#.##");
        double usdAmount = Double.parseDouble(df.format(amount / unit));

        LOGGER.info("Creating payment for amount: {} VND ({} USD)", amount, String.format("%.2f", usdAmount));

        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        Date createDate = formatter.parse(formatter.format(calendar.getTime()));
        calendar.add(Calendar.HOUR, 1);
        calendar.add(Calendar.MINUTE, 40);
        Date expireDate = formatter.parse(formatter.format(calendar.getTime()));

        String orderId = String.valueOf(System.currentTimeMillis());

        String accessToken = getAccessToken();
        Map<String, Object> payment = new HashMap<>();
        payment.put("intent", "CAPTURE");
        payment.put("purchase_units", new Object[]{
                new HashMap<String, Object>() {{
                    put("reference_id", orderId);
                    put("amount", new HashMap<String, Object>() {{
                        put("currency_code", currency);
                        put("value", String.format("%.2f", usdAmount));
                    }});
                }}
        });
        payment.put("application_context", new HashMap<String, Object>() {{
            put("return_url", successUrl);
            put("cancel_url", cancelUrl);
            put("brand_name", "Event Management");
            put("landing_page", "LOGIN");
            put("user_action", "PAY_NOW");
        }});

        LOGGER.info("Creating PayPal order with payload: {}", payment);
        ResponseEntity<Map<String, Object>> response = payPalAPI.createOrder(payment, "Bearer " + accessToken);
        if (response.getStatusCode().is2xxSuccessful()) {
            Map<String, Object> responseBody = response.getBody();
            LOGGER.info("PayPal order created: {}", responseBody);

            // Lấy PayPal orderId từ response
            assert responseBody != null;
            String paypalOrderId = (String) responseBody.get("id");
            // Cập nhật booking với paypalOrderId
            Booking booking = new Booking();
            booking.setBookingCode(paypalOrderId);
            booking.setBookingMethod("PayPal");
            booking.setBookingStatus("Pending");
            booking.setTotalPrice(amount);
            booking.setTotalPriceUSD(usdAmount);
            booking.setCreateDate(createDate);
            booking.setExpireDate(expireDate);
            Event event = eventRepository.findById(checkoutDTO.getEventId()).orElseThrow(() -> new RuntimeException("Event not found"));
            User user = userRepository.findById(checkoutDTO.getUserId()).orElseThrow(() -> new RuntimeException("User not found"));
            booking.setEvent(event);
            booking.setUser(user);
            bookingRepository.saveAndFlush(booking);

            for (Map.Entry<Integer, Integer> entry : checkoutDTO.getTickets().entrySet()) {
                Ticket ticket = ticketRepository.findById(entry.getKey()).orElseThrow(() -> new RuntimeException("Ticket not found"));
                BookingDetails details = new BookingDetails();
                details.setBooking(booking);
                details.setTicket(ticket);
                details.setQuantity(entry.getValue());
                details.setPrice(entry.getValue() * ticket.getPrice());
                bookingDetailsRepository.save(details);
            }
            return responseBody;
        } else {
            LOGGER.error("Failed to create PayPal order: {}", response.getBody());
            throw new RuntimeException("Failed to create PayPal order: " + response.getBody());
        }
    }

    public Map<String, Object> capturePayment(String orderId) throws Exception {
        LOGGER.info("Đang xác nhận đơn hàng PayPal với orderId: {}", orderId);
        String accessToken = getAccessToken();
        ResponseEntity<Map<String, Object>> response = payPalAPI.captureOrder(orderId, "Bearer " + accessToken);
        if (response.getStatusCode().is2xxSuccessful()) {
            LOGGER.info("Đã xác nhận đơn hàng: {}", response.getBody());
            return response.getBody();
        } else {
            LOGGER.error("Xác nhận đơn hàng thất bại: {}. Phản hồi: {}", orderId, response.getBody());
            throw new RuntimeException("Xác nhận đơn hàng thất bại: " + response.getBody());
        }
    }

    public void success(String orderCode, HttpServletResponse response) throws Exception {
        Map<String, Object> responsePaypal = capturePayment(orderCode);
        if ("COMPLETED".equals(responsePaypal.get("status"))) {
            Optional<Booking> optionalBooking = bookingRepository.findByBookingCode(orderCode);
            if (optionalBooking.isPresent()) {
                Booking booking = optionalBooking.get();
                booking.setBookingStatus("PAID");
                bookingRepository.save(booking);

                List<Ticket> updatedTickets = booking.getBookingDetails().stream().map(detail -> {
                    Ticket ticket = detail.getTicket();
                    ticket.setSold(ticket.getSold() + detail.getQuantity());
                    return ticket;
                }).collect(Collectors.toList());
                ticketRepository.saveAll(updatedTickets);

                // Lấy captureId từ phản hồi
                Map<String, Object> purchaseUnit = ((List<Map<String, Object>>) responsePaypal.get("purchase_units")).get(0);
                Map<String, Object> payments = (Map<String, Object>) purchaseUnit.get("payments");
                String captureId = (String) ((List<Map<String, Object>>) payments.get("captures")).get(0).get("id");

                Transaction transaction = new Transaction();
                transaction.setBooking(booking);
                transaction.setTransactionInfo(booking.getEvent().getEventName());
                transaction.setPaymentMethod("PayPal");
                transaction.setTransactionDate(new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));
                transaction.setTransactionAmount(booking.getTotalPrice());
                transaction.setTransactionAmountUSD(booking.getTotalPriceUSD());
                transaction.setTransactionStatus("SUCCESSFULLY");
                transaction.setReferenceCode(captureId); // Lưu captureId thay vì orderId
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
                LOGGER.info("Payment successful for order: {}, captureId: {}", orderCode, captureId);
                response.sendRedirect("http://localhost:3000/payment-result?orderCode=" + captureId);
            }
        } else {
            LOGGER.error(" yment not completed for order: {}. Status: {}", orderCode, responsePaypal.get("status"));
        }
    }

    public ResponseEntity<?> refundPayment(Transaction transaction) throws Exception {
        Response responseEntity = new Response();
        String captureId = transaction.getReferenceCode();
        String accessToken = getAccessToken();
        // Validate transaction state
        if ("REFUNDED".equals(transaction.getTransactionStatus())) {
            LOGGER.error("Transaction already refunded: {}", captureId);
            responseEntity.setStatusCode(0);
            responseEntity.setMsg("Transaction already refunded");
            return ResponseEntity.ok(responseEntity);
        }
        // Verify capture status
        LOGGER.info("Checking capture status for captureId: {}", captureId);
        ResponseEntity<Map<String, Object>> captureResponse = payPalAPI.getCaptureDetails(captureId, "Bearer " + accessToken);
        if (!captureResponse.getStatusCode().is2xxSuccessful() || !"COMPLETED".equals(captureResponse.getBody().get("status"))) {
            LOGGER.error("Capture ID is invalid or not eligible for refund: {}", captureResponse.getBody());
            responseEntity.setStatusCode(0);
            responseEntity.setMsg("Capture ID is invalid or not eligible");
            return ResponseEntity.ok(responseEntity);
        }
        // Calculate refund amount
        double usdAmount = transaction.getTransactionAmountUSD();
        DecimalFormat df = new DecimalFormat("#.00", new DecimalFormatSymbols(Locale.US));
        String formattedAmount = df.format(usdAmount);
        LOGGER.info("Refund amount: {} USD ({} VND)", formattedAmount, transaction.getTransactionAmount());

        // Create refund request (empty for full refund)
        Map<String, Object> refundRequest = new HashMap<>();


        LOGGER.info("Đang hoàn tiền cho captureId: {}", captureId);
        ResponseEntity<?> response = payPalAPI.refundPayment(captureId, "Bearer " + accessToken, refundRequest);
        Refund refund = new Refund();
        RefundDTO refundDTO = new RefundDTO();

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() instanceof Map<?, ?> body) {
            transaction.setTransactionStatus("REFUNDED");
            transactionRepository.save(transaction);
            String responseCode = (String) body.get("id");
            String message = "Refund " + body.get("status");
            refund.setResponseCode(responseCode);
            refund.setMessage(message);
            refund.setRefundAmount(transaction.getTransactionAmount());
            refund.setRefundAmountUSD(transaction.getTransactionAmountUSD());
            refund.setRequestDate(transaction.getTransactionDate());
            refund.setTransaction(transaction);
            refund.setStatus("SUCCESSFULLY");


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
            responseEntity.setStatusCode(1);
            responseEntity.setMsg("SUCCESSFULLY");
        }
        else {
            refund.setStatus("FAILED");
            responseEntity.setStatusCode(0);
            responseEntity.setMsg("FAILED");
            LOGGER.error("Failed to refund payment: {}", response.getBody());
        }
        refundRepository.save(refund);
        BeanUtils.copyProperties(refund, refundDTO);
        responseEntity.setData(refundDTO);
        return ResponseEntity.ok(responseEntity);
    }
}