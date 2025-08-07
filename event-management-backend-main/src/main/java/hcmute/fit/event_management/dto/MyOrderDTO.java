package hcmute.fit.event_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MyOrderDTO {
    private String orderId;
    private TransactionDTO transaction;
    private List<TicketDTO> tickets;
    private EventDTO event;
}
