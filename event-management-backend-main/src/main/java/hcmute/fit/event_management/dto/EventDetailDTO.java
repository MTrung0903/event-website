package hcmute.fit.event_management.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class EventDetailDTO {
    private EventDTO event;
    private OrganizerDTO organizer;
    private List<TicketDTO> tickets;
    private List<SegmentDTO> segments;
    private List<SponsorEventDTO> sponsors;
}
