package hcmute.fit.event_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardOrganizer {
    private String organizer;
    private long totalEvents;
    private long totalTicketsSold;
    private double totalRevenue;
    private long totalSponsors;
    private double[] revenueByMonth;
    private List<EventDTO> events;
}
