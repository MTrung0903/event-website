package hcmute.fit.event_management.dto;



import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingDTO {
    private String bookingId;
    private String totalPrice;
    private String bookingStatus;
    private String userId;
    private String bookingMethod;
    private String bookingCode;
    private Date expireDate;
    private Date createDate;
}
