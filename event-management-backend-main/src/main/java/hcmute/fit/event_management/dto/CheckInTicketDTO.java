package hcmute.fit.event_management.dto;

import hcmute.fit.event_management.entity.BookingDetails;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CheckInTicketDTO {
    private String ticketCode;
    private boolean status;
    private String qrCodeBase64;
    private TicketDTO ticketInfo;
}
