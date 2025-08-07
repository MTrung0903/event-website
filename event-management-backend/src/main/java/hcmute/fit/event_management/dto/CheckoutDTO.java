package hcmute.fit.event_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CheckoutDTO {
    private long amount;
    private int userId;
    private int eventId;
    private Map<Integer, Integer> tickets = new HashMap<Integer, Integer>();
    private String orderInfo;
}
