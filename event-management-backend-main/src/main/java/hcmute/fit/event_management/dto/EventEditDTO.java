package hcmute.fit.event_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EventEditDTO {
    private EventDTO event;
    private List<TicketDTO> ticket;
    private List<SegmentDTO> segment;
}
