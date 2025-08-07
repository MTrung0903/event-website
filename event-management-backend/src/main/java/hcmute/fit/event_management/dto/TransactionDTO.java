package hcmute.fit.event_management.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransactionDTO {
    private int transactionId;
    private String transactionDate;
    private double transactionAmount;
    private double transactionAmountUSD;
    private String paymentMethod;
    private String transactionStatus;
    private String referenceCode;
    private String transactionInfo;
    private String message;
    private String bookingId;
}
