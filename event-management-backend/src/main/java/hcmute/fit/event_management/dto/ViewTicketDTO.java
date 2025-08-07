package hcmute.fit.event_management.dto;

import hcmute.fit.event_management.entity.CheckInTicket;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ViewTicketDTO {
    private EventDTO event;
    private List<CheckInTicketDTO> tickets;
}
