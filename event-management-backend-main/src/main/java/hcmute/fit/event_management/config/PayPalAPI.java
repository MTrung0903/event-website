package hcmute.fit.event_management.config;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@FeignClient(name = "paypal", url = "${paypal.api.base-url}", configuration = PayPalConfig.class)
public interface PayPalAPI {

    @PostMapping(value = "/v1/oauth2/token", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    ResponseEntity<Map<String, Object>> getAccessToken(
            @RequestBody String body
    );

    @PostMapping(value = "/v2/checkout/orders", consumes = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<Map<String, Object>> createOrder(
            @RequestBody Map<String, Object> request,
            @RequestHeader("Authorization") String authHeader
    );

    @PostMapping(value = "/v2/checkout/orders/{orderId}/capture", consumes = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<Map<String, Object>> captureOrder(
            @PathVariable("orderId") String orderId,
            @RequestHeader("Authorization") String authHeader
    );

    @PostMapping(value = "/v2/payments/captures/{captureId}/refund", consumes = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<Map<String, Object>> refundPayment(
            @PathVariable("captureId") String captureId,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> request
    );
    @GetMapping(value = "/v2/payments/captures/{captureId}")
    ResponseEntity<Map<String, Object>> getCaptureDetails(
            @PathVariable("captureId") String captureId,
            @RequestHeader("Authorization") String authHeader
    );
}