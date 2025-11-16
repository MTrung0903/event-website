package hcmute.fit.event_management.util;

import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class VietnamCities {
    public static final Map<String, String> CITY_MAP = Map.ofEntries(
            Map.entry("ho-chi-minh", "TP. Hồ Chí Minh"),
            Map.entry("ha-noi", "Hà Nội"),
            Map.entry("da-nang", "Đà Nẵng"),
            Map.entry("hai-phong", "Hải Phòng"),
            Map.entry("can-tho", "Cần Thơ"),
            Map.entry("nha-trang", "Nha Trang"),
            Map.entry("da-lat", "Đà Lạt"),
            Map.entry("binh-duong", "Bình Dương"),
            Map.entry("dong-nai", "Đồng Nai"),
            Map.entry("quang-ninh", "Quảng Ninh"),
            Map.entry("bac-lieu", "Bạc Liêu"),
            Map.entry("an-giang", "An Giang"),
            Map.entry("ba-ria-vung-tau", "Bà Rịa - Vũng Tàu"),
            Map.entry("bac-giang", "Bắc Giang"),
            Map.entry("bac-kan", "Bắc Kạn"),
            Map.entry("bac-ninh", "Bắc Ninh"),
            Map.entry("ben-tre", "Bến Tre"),
            Map.entry("binh-dinh", "Bình Định"),
            Map.entry("binh-phuoc", "Bình Phước"),
            Map.entry("binh-thuan", "Bình Thuận"),
            Map.entry("ca-mau", "Cà Mau"),
            Map.entry("cao-bang", "Cao Bằng"),
            Map.entry("dak-lak", "Đắk Lắk"),
            Map.entry("dak-nong", "Đắk Nông"),
            Map.entry("dien-bien", "Điện Biên"),
            Map.entry("dong-thap", "Đồng Tháp"),
            Map.entry("gia-lai", "Gia Lai"),
            Map.entry("ha-giang", "Hà Giang"),
            Map.entry("ha-nam", "Hà Nam"),
            Map.entry("ha-tinh", "Hà Tĩnh"),
            Map.entry("hai-duong", "Hải Dương"),
            Map.entry("hau-giang", "Hậu Giang"),
            Map.entry("hoa-binh", "Hòa Bình"),
            Map.entry("hung-yen", "Hưng Yên"),
            Map.entry("khanh-hoa", "Khánh Hòa"),
            Map.entry("kien-giang", "Kiên Giang"),
            Map.entry("kon-tum", "Kon Tum"),
            Map.entry("lai-chau", "Lai Châu"),
            Map.entry("lam-dong", "Lâm Đồng"),
            Map.entry("lang-son", "Lạng Sơn"),
            Map.entry("lao-cai", "Lào Cai"),
            Map.entry("long-an", "Long An"),
            Map.entry("nam-dinh", "Nam Định"),
            Map.entry("nghe-an", "Nghệ An"),
            Map.entry("ninh-binh", "Ninh Bình"),
            Map.entry("ninh-thuan", "Ninh Thuận"),
            Map.entry("phu-tho", "Phú Thọ"),
            Map.entry("phu-yen", "Phú Yên"),
            Map.entry("quang-binh", "Quảng Bình"),
            Map.entry("quang-nam", "Quảng Nam"),
            Map.entry("quang-ngai", "Quảng Ngãi"),
            Map.entry("soc-trang", "Sóc Trăng"),
            Map.entry("son-la", "Sơn La"),
            Map.entry("tay-ninh", "Tây Ninh"),
            Map.entry("thai-binh", "Thái Bình"),
            Map.entry("thai-nguyen", "Thái Nguyên"),
            Map.entry("thanh-hoa", "Thanh Hóa"),
            Map.entry("thua-thien-hue", "Thừa Thiên Huế"),
            Map.entry("tien-giang", "Tiền Giang"),
            Map.entry("tra-vinh", "Trà Vinh"),
            Map.entry("tuyen-quang", "Tuyên Quang"),
            Map.entry("vinh-long", "Vĩnh Long"),
            Map.entry("vinh-phuc", "Vĩnh Phúc"),
            Map.entry("yen-bai", "Yên Bái")
    );
    public static String getCityDisplayName(String key) {
        return VietnamCities.CITY_MAP.getOrDefault(key, "Không xác định");
    }
}
