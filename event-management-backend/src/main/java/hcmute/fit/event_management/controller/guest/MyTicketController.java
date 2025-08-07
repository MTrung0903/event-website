package hcmute.fit.event_management.controller.guest;

import com.cloudinary.Cloudinary;
import hcmute.fit.event_management.dto.*;
import hcmute.fit.event_management.entity.*;
import hcmute.fit.event_management.service.ICheckInTicketService;
import hcmute.fit.event_management.service.IBookingDetailsService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static hcmute.fit.event_management.util.QRCodeUtil.generateQrCodeBase64;

@RestController
@RequestMapping("/api/ticket")
public class MyTicketController {
    @Autowired
    ICheckInTicketService checkInTicketService;
    @Autowired
    IBookingDetailsService bookingDetailsService;
    @Autowired
    private Cloudinary cloudinary;

    @GetMapping("/view-all-tickets/{userId}")
    public ResponseEntity<?> getTickets(
            @PathVariable("userId") int userId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "eventStart") String sortBy,
            @RequestParam(value = "sortOrder", defaultValue = "asc") String sortOrder,
            @RequestParam(value = "date", required = false) String date,
            @RequestParam(value = "search", required = false) String search) throws Exception {

        // Xử lý sortBy để ánh xạ với tên thuộc tính trong entity
        String sortField = sortBy.equals("price") ? "bookingDetails.ticket.price" : "bookingDetails.booking.event.eventStart";
        Sort sort = Sort.by(sortOrder.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortField);
        Pageable pageable = PageRequest.of(page, size, sort);

        // Xử lý tham số date
        LocalDate filterDate = (date != null && !date.isEmpty()) ? LocalDate.parse(date) : null;

        // Gọi service với truy vấn phân trang, lọc và tìm kiếm
        Page<CheckInTicket> checkInTicketPage = checkInTicketService.findByBookingDetailsBookingUserUserId(
                userId, filterDate, search, pageable);

        // Chuyển đổi sang TicketInfo
        List<TicketInfo> viewAllTickets = new ArrayList<>();
        for (CheckInTicket checkInTicket : checkInTicketPage.getContent()) {
            TicketInfo ticketInfo = new TicketInfo();
            BeanUtils.copyProperties(checkInTicket, ticketInfo);
            Ticket ticket = checkInTicket.getBookingDetails().getTicket();
            TicketDTO ticketDTO = new TicketDTO();
            BeanUtils.copyProperties(ticket, ticketDTO);
            ticketInfo.setTicketInfo(ticketDTO);
            Event event = checkInTicket.getBookingDetails().getBooking().getEvent();
            EventDTO eventDTO = new EventDTO();
            BeanUtils.copyProperties(event, eventDTO);
            EventLocation eventLocation = event.getEventLocation();
            EventLocationDTO eventLocationDTO = new EventLocationDTO();
            BeanUtils.copyProperties(eventLocation, eventLocationDTO);
            eventDTO.setEventLocation(eventLocationDTO);
            List<String> imageUrls = event.getEventImages().stream()
                    .map(cloudinary.url()::generate)
                    .collect(Collectors.toList());
            eventDTO.setEventImages(imageUrls);
            ticketInfo.setEventInfo(eventDTO);
            ticketInfo.setQrCodeBase64(generateQrCodeBase64(checkInTicket.getTicketCode()));
            viewAllTickets.add(ticketInfo);
        }

        // Tạo đối tượng Page cho TicketInfo
        Page<TicketInfo> ticketInfoPage = new PageImpl<>(
                viewAllTickets,
                pageable,
                checkInTicketPage.getTotalElements()
        );

        return ResponseEntity.ok(ticketInfoPage);
    }
}