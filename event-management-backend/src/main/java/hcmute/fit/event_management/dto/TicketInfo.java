package hcmute.fit.event_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TicketInfo {
    private String ticketCode;
    private boolean status;
    private String qrCodeBase64;
    private TicketDTO ticketInfo;
    private EventDTO eventInfo;
}
