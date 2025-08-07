package hcmute.fit.event_management.service.Impl;

import hcmute.fit.event_management.dto.CheckoutDTO;
import hcmute.fit.event_management.entity.*;
import hcmute.fit.event_management.repository.*;
import hcmute.fit.event_management.service.IBuyFreeTicket;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class BuyFreeTicket implements IBuyFreeTicket {
    private static final Logger logger = LoggerFactory.getLogger(BuyFreeTicket.class);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingDetailsRepository bookingDetailsRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private EmailServiceImpl emailService;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private CheckInTicketRepository checkInTicketRepository;

    @Override
    @Transactional
    public void buyFreeTicket(CheckoutDTO checkoutDTO, String bookingCode) {
        try {
            // Validate input
            if (checkoutDTO == null || checkoutDTO.getTickets() == null || checkoutDTO.getTickets().isEmpty()) {
                throw new IllegalArgumentException("CheckoutDTO or tickets cannot be null or empty");
            }

            // Fetch event and user
            Event event = eventRepository.findById(checkoutDTO.getEventId())
                    .orElseThrow(() -> new IllegalArgumentException("Event not found with ID: " + checkoutDTO.getEventId()));
            User user = userRepository.findById(checkoutDTO.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + checkoutDTO.getUserId()));
            // Initialize booking
            Booking booking = new Booking();
            LocalDateTime now = LocalDateTime.now(ZoneId.of("Etc/GMT+7"));
            booking.setCreateDate(java.sql.Timestamp.valueOf(now));
            booking.setExpireDate(java.sql.Timestamp.valueOf(now));
            booking.setBookingCode(bookingCode);
            booking.setBookingMethod("N/A");
            booking.setBookingStatus("PAID");
            booking.setTotalPrice(checkoutDTO.getAmount());
            booking.setUser(user);
            booking.setEvent(event);
            bookingRepository.save(booking);
            logger.info("Created booking with code: {}", bookingCode);
            // Process booking details
            List<BookingDetails> bookingDetailsList = new ArrayList<>();
            List<Ticket> ticketsToUpdate = new ArrayList<>();
            for (Integer ticketId : checkoutDTO.getTickets().keySet()) {
                Ticket ticket = ticketRepository.findById(ticketId)
                        .orElseThrow(() -> new IllegalArgumentException("Ticket not found with ID: " + ticketId));

                int requestedQuantity = checkoutDTO.getTickets().get(ticketId);
                if (requestedQuantity <= 0 || ticket.getQuantity() < requestedQuantity) {
                    throw new IllegalArgumentException("Invalid or insufficient ticket quantity for ticket ID: " + ticketId);
                }

                BookingDetails bookingDetails = new BookingDetails();
                bookingDetails.setBooking(booking);
                bookingDetails.setTicket(ticket);
                bookingDetails.setQuantity(requestedQuantity);
                bookingDetails.setPrice(ticket.getPrice() * requestedQuantity);
                bookingDetailsList.add(bookingDetails);

                ticket.setSold(ticket.getSold() + requestedQuantity);
                ticketsToUpdate.add(ticket);
            }

            // Batch save booking details and tickets
            bookingDetailsRepository.saveAll(bookingDetailsList);
            ticketRepository.saveAll(ticketsToUpdate);
            logger.info("Processed {} booking details for booking code: {}", bookingDetailsList.size(), bookingCode);

            // Create and save transaction
            Transaction transaction = new Transaction();
            transaction.setBooking(booking);
            transaction.setTransactionInfo(checkoutDTO.getOrderInfo());
            transaction.setPaymentMethod("N/A");
            transaction.setTransactionDate(now.toString());
            transaction.setTransactionAmount(checkoutDTO.getAmount());
            transaction.setTransactionStatus("SUCCESSFULLY");
            transaction.setReferenceCode(bookingCode);
            transactionRepository.save(transaction);
            logger.info("Created transaction for booking code: {}", bookingCode);

            // Create check-in tickets
            List<CheckInTicket> checkInTickets = new ArrayList<>();
            for (BookingDetails bookingDetails : bookingDetailsList) {
                for (int i = 0; i < bookingDetails.getQuantity(); i++) {
                    CheckInTicket checkInTicket = new CheckInTicket();
                    checkInTicket.setStatus(0);
                    checkInTicket.setTicketCode(UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase());
                    checkInTicket.setBookingDetails(bookingDetails);
                    checkInTicket.setCheckDate(now);
                    checkInTickets.add(checkInTicket);
                }
            }
            checkInTicketRepository.saveAll(checkInTickets);
            logger.info("Created {} check-in tickets for booking code: {}", checkInTickets.size(), bookingCode);

            // Send email
            emailService.sendThanksPaymentEmail(
                    user.getEmail(),
                    event.getEventName(),
                    bookingCode,
                    user.getFullName(),
                    checkInTickets
            );
            logger.info("Sent confirmation email for booking code: {}", bookingCode);

        } catch (IllegalArgumentException e) {
            logger.error("Validation error in buyFreeTicket: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error processing free ticket purchase for booking code {}: {}", bookingCode, e.getMessage(), e);
            throw new RuntimeException("Failed to process free ticket purchase: " + e.getMessage(), e);
        }
    }
}