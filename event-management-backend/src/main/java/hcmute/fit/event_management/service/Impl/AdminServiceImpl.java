package hcmute.fit.event_management.service.Impl;

import hcmute.fit.event_management.dto.DashboardStatsDTO;
import hcmute.fit.event_management.dto.EventDTO;
import hcmute.fit.event_management.dto.TransactionDTO;
import hcmute.fit.event_management.entity.*;
import hcmute.fit.event_management.repository.*;
import hcmute.fit.event_management.service.ICheckInTicketService;
import hcmute.fit.event_management.service.IEventService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import payload.PageResponse;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl {

    @Autowired
    EventRepository eventRepo;

    @Autowired
    BookingRepository bookingRepo;

    @Autowired
    TransactionRepository transactionRepo;

    @Autowired
    BookingDetailsRepository bookingDetailsRepo;

    @Autowired
    OrganizerRepository organizerRepo;

    @Autowired
    UserRepository userRepo;

    @Autowired
    IEventService eventService;

    @Autowired
    ICheckInTicketService checkInTicketService;

    public DashboardStatsDTO getDashboardStats(Integer year) {
        int currentMonth = LocalDate.now().getMonthValue();
        int previousMonth = currentMonth == 1 ? 12 : currentMonth - 1;
        int currentYear = year != null ? year : LocalDate.now().getYear();
        int prevYear = currentMonth == 1 ? currentYear - 1 : currentYear;

        // 1. Tổng số sự kiện
        long totalEvents = year != null ? eventRepo.countEventsByYear(currentYear) : eventRepo.count();
        long currentEvents = eventRepo.countEventsByMonth(currentMonth, currentYear);
        long previousEvents = eventRepo.countEventsByMonth(previousMonth, prevYear);
        String eventChange = calculateChangePercentage(currentEvents, previousEvents);

        // 2. Tổng đơn đặt
        long totalBookings = year != null ? bookingRepo.countBookingsByYear(currentYear) : bookingRepo.countBookings();
        long currentBookings = bookingRepo.countBookingsByMonth(currentMonth, currentYear);
        long previousBookings = bookingRepo.countBookingsByMonth(previousMonth, prevYear);
        String bookingChange = calculateChangePercentage(currentBookings, previousBookings);

        // 3. Tổng doanh thu
        String currentYearMonth = String.format("%04d%02d", currentYear, currentMonth);
        String previousYearMonth = String.format("%04d%02d", prevYear, previousMonth);
        List<Transaction> transactions = year != null ? transactionRepo.findByYear(currentYear) : transactionRepo.findAll();
        List<TransactionDTO> transactionDTOS = transactions.stream().map(transaction -> {
            TransactionDTO transactionDTO = new TransactionDTO();
            BeanUtils.copyProperties(transaction, transactionDTO);
            return transactionDTO;
        }).toList();

        Double totalRevenue = year != null ? transactionRepo.getRevenueByYear(currentYear) : transactionRepo.getRevenue();
        Double currentRevenue = transactionRepo.getRevenueByMonth(currentYearMonth);
        Double previousRevenue = transactionRepo.getRevenueByMonth(previousYearMonth);
        String revenueChange = calculateChangePercentage(currentRevenue != null ? currentRevenue : 0,
                previousRevenue != null ? previousRevenue : 0);

        // 4. Tổng vé đã bán
        Long totalTicketsSold = year != null ? bookingDetailsRepo.countTicketsSoldByYear(currentYear) : bookingDetailsRepo.countTotalTicketsSold();
        Long currentTicketsSold = bookingDetailsRepo.countTicketsSoldByMonth(currentMonth, currentYear);
        Long previousTicketsSold = bookingDetailsRepo.countTicketsSoldByMonth(previousMonth, prevYear);
        String ticketChange = calculateChangePercentage(
                currentTicketsSold != null ? currentTicketsSold : 0,
                previousTicketsSold != null ? previousTicketsSold : 0
        );

        // 5. Organizer theo tháng
        long currentOrganizers = organizerRepo.countOrganizersByMonth(currentMonth, currentYear);
        long previousOrganizers = organizerRepo.countOrganizersByMonth(previousMonth, prevYear);
        String organizerChange = calculateChangePercentage(currentOrganizers, previousOrganizers);
        long totalOrganizers = year != null ? organizerRepo.countOrganizersByYear(currentYear) : organizerRepo.count();

        // 6. Lấy danh sách sự kiện
        List<Event> events = eventRepo.findByYear(currentYear);
        List<EventDTO> eventDTOs = events.stream().map(event -> {
            long sold = event.getBookings().stream()
                    .mapToLong(booking -> booking.getBookingDetails().stream()
                            .mapToLong(BookingDetails::getQuantity)
                            .sum())
                    .sum();
            double eventRevenue = event.getBookings().stream()
                    .mapToDouble(booking -> booking.getTransaction() != null
                            ? booking.getTransaction().getTransactionAmount() * 0.03
                            : 0)
                    .sum();
            EventDTO eventDTO = eventService.convertToDTO(event);
            eventDTO.setSold(sold);
            eventDTO.setEventRevenue(eventRevenue);
            return eventDTO;
        }).toList();
        // 7. Tính các chỉ số mới
        // 7.1 Total Revenue YTD
        double totalRevenueYTD = 0.0;
        for (int month = 1; month <= (year != null ? 12 : currentMonth); month++) {
            String yearMonth = String.format("%04d%02d", currentYear, month);
            Double revenue = transactionRepo.getRevenueByMonth(yearMonth);
            totalRevenueYTD += revenue != null ? revenue : 0.0;
        }

        // 7.2 Average Ticket Price
        Double averageTicketPrice = totalTicketsSold != null && totalTicketsSold > 0 ?
                (totalRevenue != null ? totalRevenue : 0.0) / totalTicketsSold : 0.0;

        // 7.3 Refund Rate
        long totalRefundAmount = transactions.stream()
                .filter(t -> "REFUNDED".equals(t.getTransactionStatus()))
                .count();
        double refundRate = !transactions.isEmpty() ? (double) totalRefundAmount / transactions.size() * 100 : 0;

        // 7.4 New Organizers This Month
        long newOrganizersThisMonth = organizerRepo.countOrganizersByMonth(currentMonth, currentYear);

        // 7.5 Booking Conversion Rate
        long confirmedBookings = events.stream()
                .flatMap(e -> e.getBookings().stream())
                .filter(b -> "PAID".equals(b.getBookingStatus()))
                .count();
        Double bookingConversionRate = totalBookings > 0 ?
                (confirmedBookings / (double) totalBookings * 100) : 0.0;

        // 7.6 Top Event Category
        Map<String, Double> revenueByCategory = events.stream()
                .collect(Collectors.toMap(
                        event -> event.getEventType().getTypeName(),
                        event -> event.getBookings().stream()
                                .filter(b -> "PAID".equals(b.getBookingStatus()))
                                .mapToDouble(b -> b.getTransaction() != null ? b.getTransaction().getTransactionAmount() * 0.03 : 0.0)
                                .sum(),
                        Double::sum
                ));
        String topEventCategory = revenueByCategory.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");

        List<CheckInTicket> tickets = checkInTicketService.findAll().stream()
                .filter(t -> t.getBookingDetails().getTicket().getEvent().getEventStart().getYear() == currentYear)
                .toList();
        double totalCheckInTickets = tickets
                .stream()
                .filter(t -> t.getStatus() == 1)
                .count();
        double totalTickets = tickets
                .stream()
                .filter(t -> t.getStatus() != -1)
                .count();
        double averageAttendanceRate = (totalCheckInTickets > 0) ? (totalCheckInTickets / totalTickets * 100) : 0.0;


        // 7.8 Total Active Events
        long totalActiveEvents = events.stream()
                .filter(e -> "public".equals(e.getEventStatus()))
                .count();
        return new DashboardStatsDTO(
                totalEvents, currentEvents, eventChange,
                totalBookings, currentBookings, bookingChange,
                totalRevenue, currentRevenue != null ? currentRevenue : 0.0, revenueChange,
                totalOrganizers, currentOrganizers, organizerChange,
                totalTicketsSold, currentTicketsSold != null ? currentTicketsSold : 0L, ticketChange,
                transactionDTOS,
                totalRevenueYTD, refundRate,
                newOrganizersThisMonth, bookingConversionRate,
                topEventCategory, averageAttendanceRate,
                totalActiveEvents,
                eventDTOs
        );
    }
    public PageResponse getEvents(String search, int page, int size, String sort) {
        Pageable pageable;
        if (sort != null && !sort.isEmpty()) {
            String[] sortParts = sort.split(",");
            String sortColumn = sortParts[0];
            Sort.Direction sortDirection = sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
            // Map frontend column names to query aliases or entity fields
            String mappedSortColumn = switch (sortColumn) {
                case "sold" -> "sold";
                case "eventRevenue" -> "eventRevenue";
                case "eventName" -> "eventName";
                case "eventHost" -> "eventHost";
                case "eventStatus" -> "eventStatus";
                default -> "eventName"; // Default sorting column
            };
            Sort sortBy = Sort.by(sortDirection, mappedSortColumn);
            pageable = PageRequest.of(page, size, sortBy);
        } else {
            pageable = PageRequest.of(page, size);
        }

        Page<Object[]> pageEvents = eventRepo.findWithFiltersAndCalculations(search, pageable);
        List<EventDTO> eventDTOs = pageEvents.getContent().stream().map(result -> {
            Event event = (Event) result[0];
            Long sold = (Long) result[1];
            Double eventRevenue = (Double) result[2];
            EventDTO eventDTO = eventService.convertToDTO(event);
            eventDTO.setSold(sold);
            eventDTO.setEventRevenue(eventRevenue);
            return eventDTO;
        }).collect(Collectors.toList());

        return new PageResponse(eventDTOs, pageEvents.getTotalPages(), pageEvents.getTotalElements());
    }
    public String calculateChangePercentage(double current, double previous) {
        if (previous == 0) return current == 0 ? "0%" : "+100%";
        double change = ((current - previous) / previous) * 100;
        return (change >= 0 ? "+" : "") + String.format("%.1f", change) + "%";
    }
}