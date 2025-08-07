package hcmute.fit.event_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderTicketDTO {
    private int OrderID;
    private String ticketName;
    private String ticketType;
    private int quantity;
    private double amount;
    private Date dateOrdered;
}
