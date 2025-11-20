package hcmute.fit.event_management.controller.organizer;

import hcmute.fit.event_management.dto.DashboardOrganizer;
import hcmute.fit.event_management.dto.EventDTO;
import hcmute.fit.event_management.entity.*;
import hcmute.fit.event_management.mapper.EventMapper;
import hcmute.fit.event_management.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/organizer/dashboard")
public class OrganizerDashboardController {

    private final UserService userService;

    private final BookingDetailsService bookingDetailsService;

    private final TransactionService transactionService;

    private final SponsorEventService sponsorEventService;

    private final OrganizerService organizerService;


    private final EventSearchService eventSearchService;


    private final EventMapper eventMapper;

    public OrganizerDashboardController(BookingDetailsService bookingDetailsService,
                                        UserService userService, TransactionService transactionService,
                                        SponsorEventService sponsorEventService, OrganizerService organizerService,
                                        EventSearchService eventSearchService, EventMapper eventMapper) {
        this.bookingDetailsService = bookingDetailsService;
        this.userService = userService;
        this.transactionService = transactionService;
        this.sponsorEventService = sponsorEventService;
        this.organizerService = organizerService;
        this.eventSearchService = eventSearchService;
        this.eventMapper = eventMapper;
    }

    @GetMapping
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<?> getDashboardData(
            Authentication authentication,
            @RequestParam(value = "year", required = false) Integer year) {
        // Get Organizer based on authenticated user
        String username = authentication.getName();
        Optional<User> userOpt = userService.findByEmail(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        User user = userOpt.get();
        int userId = user.getUserId();

        // Fetch organizer's events, filtered by year if provided
        List<Event> events = year != null
                ? eventSearchService.findByUserUserIdAndYear(userId, year)
                : eventSearchService.findByUserUserId(userId);

        // Compute metrics
        long totalEvents = events.size();
        long totalTicketsSold = year != null
                ? bookingDetailsService.countTicketsSoldByOrganizerAndYear(userId, year)
                : bookingDetailsService.countTicketsSoldByOrganizer(userId);
        double totalRevenue = year != null
                ? transactionService.sumRevenueByOrganizerAndYear(userId, year)
                : transactionService.sumRevenueByOrganizer(userId);
        long totalSponsors = year != null
                ? sponsorEventService.countSponsorsByOrganizerAndYear(userId, year)
                : sponsorEventService.countSponsorsByOrganizer(userId);

        // Revenue by month for the specified year (or all years if year is null)
        List<Transaction> transactions = year != null
                ? transactionService.findByOrganizerAndYear(userId, year)
                : transactionService.findByOrganizer(userId);
        double[] revenueByMonth = new double[12];
        transactions.forEach(transaction -> {
            String dateStr = transaction.getTransactionDate();
            int monthIndex = Integer.parseInt(dateStr.substring(4, 6), 10) - 1;
            if (monthIndex >= 0 && monthIndex < 12) {
                revenueByMonth[monthIndex] += transaction.getTransactionAmount() * 0.97;
            }
        });

        // Events with stats
        List<EventDTO> eventsWithStats = events.stream().map(event -> {
            long sold = event.getBookings().stream()
                    .mapToLong(booking -> booking.getBookingDetails().stream()
                            .mapToLong(BookingDetails::getQuantity)
                            .sum())
                    .sum();
            double eventRevenue = event.getBookings().stream()
                    .mapToDouble(booking -> booking.getTransaction() != null
                            ? booking.getTransaction().getTransactionAmount() * 0.97
                            : 0)
                    .sum();
            EventDTO eventDTO = eventMapper.toDto(event);
            eventDTO.setSold(sold);
            eventDTO.setEventRevenue(eventRevenue);
            return eventDTO;
        }).toList();

        // Create DashboardOrganizer DTO
        DashboardOrganizer dashboardOrganizer = new DashboardOrganizer();
        Organizer organizer = organizerService.findByUserUserId(userId);
        dashboardOrganizer.setOrganizer(organizer != null ? organizer.getOrganizerName() : "N/A");
        dashboardOrganizer.setTotalEvents(totalEvents);
        dashboardOrganizer.setRevenueByMonth(revenueByMonth);
        dashboardOrganizer.setEvents(eventsWithStats);
        dashboardOrganizer.setTotalSponsors(totalSponsors);
        dashboardOrganizer.setTotalRevenue(totalRevenue);
        dashboardOrganizer.setTotalTicketsSold(totalTicketsSold);

        return ResponseEntity.ok(dashboardOrganizer);
    }
}