package hcmute.fit.event_management.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
//pring Boot không tự động phục vụ file từ thư mục ngoài (như D:uploads).
//Nếu không có StaticResourceConfig, yêu cầu /uploads/<filename> sẽ trả về lỗi 404 Not Found,
// vì backend không biết tìm file ở đâu.
@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry
                .addResourceHandler("/uploads/**")
                .addResourceLocations("file:///D:/Uploads/");
        System.out.println("StaticResourceConfig loaded, serving files from D:/Uploads");
    }
}
