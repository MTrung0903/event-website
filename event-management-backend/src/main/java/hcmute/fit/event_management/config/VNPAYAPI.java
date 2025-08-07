package hcmute.fit.event_management.config;

import hcmute.fit.event_management.dto.MomoRequestPayment;
import hcmute.fit.event_management.dto.VNPAYRefund;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDateTime;
import java.util.Map;

@FeignClient(name="vnpay", url = "${vnpay.refundUrl}")
public interface VNPAYAPI {
    @PostMapping("")
    ResponseEntity<?> refundVNPAY(@RequestBody VNPAYRefund request);
}
