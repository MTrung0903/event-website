package hcmute.fit.event_management.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EventDTO {
    private int eventId;
    private String eventName;
    private String eventDesc;
    private Long eventTypeId;
    private String eventType;
    private String eventHost;
    private String eventStatus;
    @NotNull(message = "Event start time is required")
    @FutureOrPresent(message = "Event start time must be in the present or future")
    private LocalDateTime eventStart;
    @NotNull(message = "Event end time is required")
    @FutureOrPresent(message = "Event end time must be in the present or future")
    private LocalDateTime eventEnd;
    private EventLocationDTO eventLocation;
    private String tags;
    private String eventVisibility;
    private LocalDateTime publishTime;
    private String refunds;
    private int validityDays;
    private List<String> eventImages;
    private String seatingMapImage;
    private String seatingLayout;
    private List<String> seatingMapImageVersions;
    private String eventImage;
    private String textContent;
    private List<String> mediaContent;
    private Integer userId;
    private long sold;
    private double eventRevenue;
    private Double total;
    private Long viewCount;
}
