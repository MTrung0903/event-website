package hcmute.fit.event_management.dto;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MomoRequestPayment {
    private String partnerCode;
    private String requestType;
    private String ipnUrl;
    private String redirectUrl;
    private String orderId;
    private String orderInfo;
    private String requestId;
    private long amount;
    private String transId;
    private String extraData;
    private String signature;
    private String lang;
}

