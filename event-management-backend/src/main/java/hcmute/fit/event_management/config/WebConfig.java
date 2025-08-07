package hcmute.fit.event_management.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

//được thêm để xử lý vấn đề CORS (Cross-Origin Resource Sharing)
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/uploads/**")
                .allowedOrigins("http://localhost:3000/")
                .allowedMethods("GET");
        System.out.println("WebConfig loaded, CORS enabled for /uploads/**");
    }
}
