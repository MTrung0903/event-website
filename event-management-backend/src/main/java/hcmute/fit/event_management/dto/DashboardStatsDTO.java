package hcmute.fit.event_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsDTO {
    private long totalEvents;
    private long currentEvents;
    private String eventChange;
    private long totalBookings;
    private long currentBookings;
    private String bookingChange;
    private Double totalRevenue;
    private Double currentRevenue;
    private String revenueChange;
    private long totalOrganizers;
    private long currentOrganizers;
    private String organizerChange;
    private Long totalTicketsSold;
    private Long currentTicketsSold;
    private String ticketChange;
    private List<TransactionDTO> transactions;
    private double totalRevenueYTD;
    private double refundRate;
    private long newOrganizersThisMonth;
    private Double bookingConversionRate;
    private String topEventCategory;
    private double averageAttendanceRate;
    private long totalActiveEvents;
    private List<EventDTO> events;

}

