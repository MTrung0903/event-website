package hcmute.fit.event_management.service.Impl;

import hcmute.fit.event_management.dto.TicketDTO;
import hcmute.fit.event_management.entity.*;
import hcmute.fit.event_management.repository.*;
import hcmute.fit.event_management.service.ITicketService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import payload.Response;

import java.util.*;

@Service
public class TicketServiceImpl implements ITicketService {
    @Autowired
    private TicketRepository ticketRepository;
    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private BookingDetailsRepository bookingDetailsRepository;
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private UserRepository userRepository;
    Logger logger = LoggerFactory.getLogger(this.getClass());
    public TicketServiceImpl(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    @Override
    public Optional<Ticket> findById(Integer ticketId) {
        return ticketRepository.findById(ticketId);
    }

    @Override
    public Response deleteById(Integer ticketId) {
        Optional<Ticket> ticket = ticketRepository.findById(ticketId);
        Response response = new Response();
        if (ticket.isPresent()) {
            Event event = ticket.get().getEvent();
            if("Complete".equals(event.getEventStatus())){

                response.setStatusCode(401);
                response.setMsg("The event has been completed, cannot delete tickets");
                response.setData(false);
                return response;
            }
            List<BookingDetails> list = bookingDetailsRepository.findByTicketId(ticketId);
            if (!list.isEmpty() && list.size() > 0) {
                response.setStatusCode(401);
                response.setMsg("Tickets of the event were sold, not possible");
                response.setData(false);
                return response;
            }else {
                ticketRepository.deleteById(ticketId);

                response.setStatusCode(200);
                response.setMsg("Successful delete tickets");
                response.setData(true);
                return response;
            }
        }

        return null;
    }

    @Override
    public void addTicket(int eventId, TicketDTO ticketDTO) {
        // Kiểm tra vé trùng lặp
        Optional<Ticket> existingTicket = ticketRepository.findByEventIdAndTicketNameAndTicketTypeAndPriceAndQuantityAndStartTimeAndEndTime(
                eventId,
                ticketDTO.getTicketName(),
                ticketDTO.getTicketType(),
                ticketDTO.getPrice(),
                ticketDTO.getQuantity(),
                ticketDTO.getStartTime(),
                ticketDTO.getEndTime()
        );

        if (existingTicket.isPresent()) {
            // Nếu vé đã tồn tại, không thêm mới mà ghi log
            logger.info("Ticket already exists for event id {} with ticket id {}", eventId, existingTicket.get().getTicketId());
            return;
        }

        // Tạo vé mới
        Ticket ticket = new Ticket();
        ticket.setTicketName(ticketDTO.getTicketName());
        ticket.setTicketType(ticketDTO.getTicketType());
        ticket.setPrice(ticketDTO.getPrice());
        ticket.setQuantity(ticketDTO.getQuantity());
        ticket.setStartTime(ticketDTO.getStartTime());
        ticket.setEndTime(ticketDTO.getEndTime());
        ticket.setSold(ticketDTO.getSold() != 0 ? ticketDTO.getSold() : 0);

        Optional<Event> optionalEvent = eventRepository.findById(eventId);
        if (optionalEvent.isEmpty()) {
            throw new RuntimeException("Event not found with id: " + eventId);
        }
        ticket.setEvent(optionalEvent.get());

        ticketRepository.save(ticket);
        logger.info("Added new ticket for event id {}: {}", eventId, ticketDTO.getTicketName());
    }

    public TicketDTO convertToDTO(Ticket ticket) {
        TicketDTO ticketDTO = new TicketDTO();
        BeanUtils.copyProperties(ticket, ticketDTO);
        return ticketDTO;
    }

    @Override
    public List<TicketDTO> getTicketsByEventId(int eventId) {
        List<Ticket> tickets = ticketRepository.findByEventID(eventId);
        List<TicketDTO> ticketDTOs = new ArrayList<>();
        for (Ticket ticket : tickets) {
            TicketDTO ticketDTO = convertToDTO(ticket);
            ticketDTOs.add(ticketDTO);
        }
        return ticketDTOs;
    }

    @Override
    public void saveEditTicket(int eventId, TicketDTO ticketDTO) throws Exception {
        if (ticketDTO.getTicketId() == null) {
            throw new IllegalArgumentException("Ticket ID cannot be null for updating");
        }

        Optional<Ticket> existingTicketOpt = ticketRepository.findById(ticketDTO.getTicketId());
        if (existingTicketOpt.isEmpty()) {
            throw new ResourceNotFoundException("Ticket not found with id: " + ticketDTO.getTicketId());
        }

        Ticket ticket = existingTicketOpt.get();
        if (ticket.getEvent().getEventID() != eventId) {
            throw new IllegalArgumentException("Ticket does not belong to event id " + eventId);
        }

        ticket.setTicketName(ticketDTO.getTicketName());
        ticket.setTicketType(ticketDTO.getTicketType());
        ticket.setPrice(ticketDTO.getPrice());
        ticket.setQuantity(ticketDTO.getQuantity());
        ticket.setStartTime(ticketDTO.getStartTime());
        ticket.setEndTime(ticketDTO.getEndTime());
        ticket.setSold(ticketDTO.getSold() != 0 ? ticketDTO.getSold() : ticket.getSold());

        ticketRepository.save(ticket);
    }

    @Override
    public void deleteTicketByEventId(int eventId) {
        List<Ticket> tickets = ticketRepository.findByEventID(eventId);
        if (!tickets.isEmpty()) {
            for (Ticket ticket : tickets) {
                ticketRepository.delete(ticket);
            }
        }
    }
    @Override
    public List<Ticket> findByEventUserUserId(int userId) {
        return ticketRepository.findByEventUserUserId(userId);
    }
    @Override
    public List<Ticket> findByEventEventID(int eventId) {
        return ticketRepository.findByEventEventID(eventId);
    }
    @Override
    public <S extends Ticket> S save(S entity) {
        return ticketRepository.save(entity);
    }

    @Override
    public Response checkBeforeBuyTicket(String userEmail, int eventId) {
        Response response = new Response();

        // Find user by email
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        if (userOpt.isEmpty()) {
            response.setStatusCode(404);
            response.setMsg("User not found with email: " + userEmail);
            response.setData(null);
            return response;
        }
        User user = userOpt.get();

        // Find event
        Optional<Event> eventOpt = eventRepository.findById(eventId);
        if (eventOpt.isEmpty()) {
            response.setStatusCode(404);
            response.setMsg("Event not found with id: " + eventId);
            response.setData(null);
            return response;
        }

        // Get all bookings for the user and event
        List<Booking> bookings = bookingRepository.findByEventEventID(eventId);
        int paidTicketCount = 0;
        int freeTicketCount = 0;

        for (Booking booking : bookings) {
            if (booking.getUser().getUserId() == user.getUserId()) {
                List<BookingDetails> bookingDetails = bookingDetailsRepository.findByBookingId(booking.getBookingId());
                for (BookingDetails detail : bookingDetails) {
                    String ticketType = detail.getTicket().getTicketType().toLowerCase();
                    if (ticketType.equals("free")) {
                        freeTicketCount += detail.getQuantity();
                    } else {
                        paidTicketCount += detail.getQuantity();
                    }
                }
            }
        }

        // Calculate remaining tickets
        int maxFreeTickets = 1;
        int maxPaidTickets = 10;
        int remainingFreeTickets = maxFreeTickets - freeTicketCount;
        int remainingPaidTickets = maxPaidTickets - paidTicketCount;

        // Prepare response data
        Map<String, Integer> remainingTickets = new HashMap<>();
        remainingTickets.put("remainingFreeTickets", Math.max(0, remainingFreeTickets));
        remainingTickets.put("remainingPaidTickets", Math.max(0, remainingPaidTickets));

        // Check if user can still purchase tickets
        if (remainingFreeTickets <= 0 && remainingPaidTickets <= 0) {
            response.setStatusCode(403);
            response.setMsg("User has reached the maximum limit for both free and paid tickets for this event.");
            response.setData(remainingTickets);
            return response;
        }

        response.setStatusCode(200);
        response.setMsg("User can purchase up to " + remainingFreeTickets + " free ticket and " +
                remainingPaidTickets + " paid tickets for this event.");
        response.setData(remainingTickets);
        return response;
    }
}