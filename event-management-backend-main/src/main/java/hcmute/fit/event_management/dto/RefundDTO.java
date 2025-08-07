package hcmute.fit.event_management.dto;

import hcmute.fit.event_management.entity.Transaction;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RefundDTO {
    private int refundId;
    private Date requestDate;
    private double refundAmount;
    private String status;
    private String responseCode;
    private String message;
    private int transactionId;
}
