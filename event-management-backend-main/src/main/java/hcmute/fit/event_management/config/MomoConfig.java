package hcmute.fit.event_management.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "momo")
@Data
public class MomoConfig {
    private String partnerCode;
    private String accessKey;
    private String secretKey;
    private String requestType;
    private String ipnUrl;
    private String redirectUrl;

}
