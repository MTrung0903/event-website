package hcmute.fit.event_management.config;

import feign.Logger;
import feign.RequestInterceptor;
import feign.codec.ErrorDecoder;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Base64;

@Configuration
@Data
public class PayPalConfig {

    @Value("${paypal.client.id}")
    private String clientId;

    @Value("${paypal.client.secret}")
    private String clientSecret;

    @Value("${paypal.SUCCESS_URL}")
    private String successUrl;

    @Value("${paypal.CANCEL_URL}")
    private String cancelUrl;

    @Bean
    public RequestInterceptor requestInterceptor() {
        return request -> {
            if (request.url().contains("/v1/oauth2/token")) {
                String auth = clientId + ":" + clientSecret;
                String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
                request.header("Authorization", "Basic " + encodedAuth);
                request.header("Content-Type", "application/x-www-form-urlencoded");
                request.header("Accept", "application/json");
                request.header("Accept-Language", "en_US");
            } else {
                request.header("Content-Type", "application/json");
            }
        };
    }

    @Bean
    public Logger.Level feignLoggerLevel() {
        return Logger.Level.FULL; // Enable full logging for debugging
    }

    @Bean
    public ErrorDecoder errorDecoder() {
        return (methodKey, response) -> {
            String errorMessage = response.body() != null ? response.body().toString() : "No response body";
            if (response.status() >= 400 && response.status() <= 499) {
                return new feign.FeignException.BadRequest(
                        String.format("PayPal API error [%d]: %s", response.status(), errorMessage),
                        response.request(),
                        null,
                        response.headers()
                );
            }
            return new ErrorDecoder.Default().decode(methodKey, response);
        };
    }
}