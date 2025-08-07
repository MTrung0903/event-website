package hcmute.fit.event_management.controller.guest;

import com.cloudinary.Cloudinary;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import hcmute.fit.event_management.dto.*;
import hcmute.fit.event_management.entity.*;
import hcmute.fit.event_management.repository.BookingRepository;
import hcmute.fit.event_management.service.IBookingDetailsService;
import hcmute.fit.event_management.service.IBookingService;
import hcmute.fit.event_management.service.ITransactionService;
import hcmute.fit.event_management.service.Impl.EmailServiceImpl;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import payload.Response;

import java.util.Date;
import java.util.List;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.*;
import java.util.stream.Collectors;

import static hcmute.fit.event_management.util.QRCodeUtil.generateQrCodeBase64;

@RestController
@RequestMapping("/api/v1/booking")
public class OrderController {
    @Autowired
    IBookingService bookingService;
    @Autowired
    IBookingDetailsService bookingDetailsService;
    @Autowired
    ITransactionService transactionService;
    @Autowired
    private Cloudinary cloudinary;
    @Autowired
    private EmailServiceImpl emailServiceImpl;
    @Autowired
    BookingRepository bookingRepository;
    @GetMapping("/{userId}")
    public ResponseEntity<?> getOrder(@PathVariable("userId") int userId) {
        List<Booking> bookings = bookingService.findByUserId(userId);
        // Lọc các đơn hết hạn & chưa thanh toán để xóa
        List<Booking> expiredUnpaidBookings = bookings.stream()
                .filter(b -> b.getExpireDate().before(new Date()) && "PENDING".equals(b.getBookingStatus()))
                .collect(Collectors.toList());

        // Chỉ lấy các đơn đã thanh toán
        List<Booking> paidBookings = bookings.stream()
                .filter(b -> "PAID".equals(b.getBookingStatus()) || "CANCELED".equals(b.getBookingStatus()))
                .toList();

        // Xóa các đơn hết hạn chưa thanh toán
        bookingService.deleteAll(expiredUnpaidBookings);

        // Chuyển đổi sang MyOrderDTO
        List<MyOrderDTO> myOrderDTOList = paidBookings.stream().map(booking -> {
            MyOrderDTO myOrderDTO = new MyOrderDTO();
            // Set thông tin giao dịch nếu có
            Transaction transaction = booking.getTransaction();
            TransactionDTO transactionDTO = new TransactionDTO();
            BeanUtils.copyProperties(transaction, transactionDTO);
            myOrderDTO.setTransaction(transactionDTO);
            // Set thông tin sự kiện
            Event event = booking.getEvent();
            EventLocation eventLocation = event.getEventLocation();
            EventLocationDTO eventLocationDTO = new EventLocationDTO();
            BeanUtils.copyProperties(eventLocation, eventLocationDTO);
            EventDTO eventDTO = new EventDTO();
            eventDTO.setEventLocation(eventLocationDTO);
            BeanUtils.copyProperties(event, eventDTO);
            System.out.println("<<<<<<<<<<<<<" + eventDTO + ">>>>>>>>>>>>>>>>>");
            List<String> imageUrls = event.getEventImages().stream()
                    .map(cloudinary.url()::generate)
                    .collect(Collectors.toList());
            eventDTO.setEventImages(imageUrls);
            myOrderDTO.setEvent(eventDTO);

            // Set danh sách vé
            List<TicketDTO> ticketDTOS = booking.getBookingDetails().stream().map(detail -> {
                TicketDTO ticketDTO = new TicketDTO();
                BeanUtils.copyProperties(detail.getTicket(), ticketDTO);
                ticketDTO.setQuantity(detail.getQuantity());
                return ticketDTO;
            }).collect(Collectors.toList());
            myOrderDTO.setTickets(ticketDTOS);
            myOrderDTO.setOrderId(transaction.getReferenceCode());
            return myOrderDTO;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(myOrderDTOList);
    }
    @GetMapping("/{userId}/has-bought-free-ticket/{eventId}")
    public ResponseEntity<Response> checkBoughtFreeTicket(@PathVariable("userId") int userId, @PathVariable("eventId") int eventId) {
        boolean hasBoughtFreeTicket = bookingService.hasBoughtFreeTicket(userId, eventId);
        Response response = new Response();
        response.setData(hasBoughtFreeTicket);
        if(hasBoughtFreeTicket) response.setMsg("Has bought free ticket");
        else response.setMsg("Has not bought free ticket");
        response.setStatusCode(200);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/{orderCode}/tickets")
    public ResponseEntity<?> getTickets(@PathVariable("orderCode") String orderCode) throws Exception {
        ViewTicketDTO viewTicketDTO = new ViewTicketDTO();
        Transaction transaction = transactionService.findByOrderCode(orderCode).orElse(new Transaction());
        Booking booking = transaction.getBooking();
        // Lay event
        Event event = booking.getEvent();
        EventDTO eventDTO = new EventDTO();
        BeanUtils.copyProperties(event,eventDTO);
        EventLocation eventLocation = event.getEventLocation();
        EventLocationDTO eventLocationDTO = new EventLocationDTO();
        BeanUtils.copyProperties(eventLocation, eventLocationDTO);
        eventDTO.setEventLocation(eventLocationDTO);
        List<String> imageUrls = event.getEventImages().stream()
                .map(cloudinary.url()::generate)
                .collect(Collectors.toList());
        eventDTO.setEventImages(imageUrls);
        viewTicketDTO.setEvent(eventDTO);
        // Lay ticket
        List<BookingDetails> bookingTickets = booking.getBookingDetails();
        List<CheckInTicketDTO> tickets = new ArrayList<>();
        for (BookingDetails bookingTicket : bookingTickets) {
            // ticket info
            Ticket ticket = bookingTicket.getTicket();
            TicketDTO ticketInfo = new TicketDTO();
            BeanUtils.copyProperties(ticket, ticketInfo);
            // list ticket checkin
            List<CheckInTicket> ticketTemps = bookingTicket.getCheckInTickets();
            for (CheckInTicket ticketTemp : ticketTemps) {
                CheckInTicketDTO checkInTicketDTO = new CheckInTicketDTO();
                BeanUtils.copyProperties(ticketTemp, checkInTicketDTO);
                checkInTicketDTO.setTicketInfo(ticketInfo);
                checkInTicketDTO.setQrCodeBase64(generateQrCodeBase64(checkInTicketDTO.getTicketCode()));
                tickets.add(checkInTicketDTO);
            }
        }
        viewTicketDTO.setTickets(tickets);
        return ResponseEntity.ok(viewTicketDTO);
    }

}
