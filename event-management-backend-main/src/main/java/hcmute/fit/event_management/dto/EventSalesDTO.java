package hcmute.fit.event_management.dto;

import hcmute.fit.event_management.entity.EventLocation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data

public class EventSalesDTO {
    private int eventId;
    private String eventName;
    private String venueName;
    private String eventType;
    private long totalQuantity;
    private double totalRevenue;
    private String eventStatus;
    private String eventImage;

    public EventSalesDTO(int eventId, String eventName, String venueName, String eventType,
                         long totalQuantity, double totalRevenue, String eventStatus, String eventImage) {
        this.eventId = eventId;
        this.eventName = eventName;
        this.venueName = venueName;
        this.eventType = eventType;
        this.totalQuantity = totalQuantity;
        this.totalRevenue = totalRevenue;
        this.eventStatus = eventStatus;
        this.eventImage = eventImage;
    }

    // Getters và Setters (có thể dùng @Data nếu dùng Lombok)
}

