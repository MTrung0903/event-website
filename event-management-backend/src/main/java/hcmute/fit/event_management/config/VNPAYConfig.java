package hcmute.fit.event_management.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;


@Configuration
@ConfigurationProperties(prefix = "vnpay")
@Data
public class VNPAYConfig {
    private String tmnCode;
    private String secretKey;
    private String payUrl;
    private String returnUrl;
}

