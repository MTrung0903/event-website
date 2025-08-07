# Event Management Website

# Đồ án tốt nghiệp - **Trường Đại học Sư phạm Kỹ thuật Thành phố Hồ Chí Minh**

## **Giới thiệu**

**Event Management** là hệ thống quản lý sự kiện trực tuyến, cho phép tổ chức, quản lý, tham gia và vận hành các sự kiện một cách toàn diện. Ứng dụng hỗ trợ nhiều vai trò người dùng, từ quản trị viên, ban tổ chức, nhân viên hỗ trợ, đến người tham dự, với các chức năng chuyên biệt cho từng vai trò.

Thành viên thực hiện : Hồ Minh Trung - Nguyễn Thanh Tùng

Link github gốc :

**Front-end** :[https://github.com/Tungdever/event-management.git](https://github.com/Tungdever/event-management.git)

**Back-end** : [https://github.com/Tungdever/event-management-server.git](https://github.com/Tungdever/event-management-server.git)

**Event-recommendation :** [https://github.com/Tungdever/event-recommendation.git](https://github.com/Tungdever/event-recommendation.git)

## Kiến trúc hệ thống

![System architecture](/event-management-backend/uploads/ERD_new.drawio.png)

## Lược đồ cơ sở dữ liệu

![ERD](/event-management-backend/uploads/erd.png)
## Cấu trúc thư mục dự án

```sql
event-website/
├── event-management-frontend/        # Frontend application
│   ├── src/
│   │   ├── components/             # React components dùng chung
│   │   ├── pages/                  # Các trang chức năng
│   │   │   ├── AdminBoard/         # Trang quản trị hệ thống
│   │   │   ├── Auth/               # Xác thực người dùng
│   │   │   │   └── ComponentSignup/ # Component đăng ký
│   │   │   ├── Booking/            # Quản lý đặt vé
│   │   │   ├── ChatBox/            # Hệ thống chat
│   │   │   ├── Checkout/           # Thanh toán
│   │   │   ├── Dashboard/          # Bảng điều khiển
│   │   │   ├── Event/              # Quản lý sự kiện
│   │   │   ├── Session/            # Quản lý phiên làm việc
│   │   │   ├── Speaker/            # Quản lý diễn giả
│   │   │   ├── Sponsor/            # Quản lý nhà tài trợ
│   │   │   └── Ticket/             # Quản lý vé
│   │   ├── assets/                 # Tài nguyên media (ảnh, icon, logo)
│   │   ├── fonts/                  # Font chữ custom
│   │   └── style/                  # Style và CSS
│   ├── public/                     # Tài nguyên tĩnh (index.html, favicon, manifest)
│   ├── package.json                # Dependencies và scripts
│   ├── tailwind.config.js          # Cấu hình Tailwind CSS
│   └── Procfile                    # Cấu hình deploy
│
├── event-management-backend/        # Backend server
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/hcmute/fit/event_management/
│   │   │   │   ├── config/         # Cấu hình Spring Boot
│   │   │   │   ├── controller/     # REST Controllers
│   │   │   │   │   ├── admin/      # Controller cho Admin
│   │   │   │   │   ├── guest/      # Controller cho Guest
│   │   │   │   │   └── manager/    # Controller cho Manager
│   │   │   │   ├── dto/            # Data Transfer Objects
│   │   │   │   ├── entity/         # JPA Entities (Database models)
│   │   │   │   │   └── keys/       # Composite keys
│   │   │   │   ├── repository/     # JPA Repositories (Data access layer)
│   │   │   │   ├── security/       # Spring Security configuration
│   │   │   │   ├── service/        # Business logic services
│   │   │   │   │   └── Impl/       # Service implementations
│   │   │   │   └── util/           # Utility functions
│   │   │   ├── resources/          # Application resources
│   │   │   │   ├── application.properties # Cấu hình ứng dụng
│   │   │   │   └── logback-spring.xml # Cấu hình logging
│   │   │   └── test/               # Unit tests
│   │   └── test/                   # Integration tests
│   ├── uploads/                    # Thư mục lưu file upload (ảnh, tài liệu)
│   ├── logs/                       # Thư mục log
│   ├── pom.xml                     # Maven dependencies
│   └── Dockerfile                  # Docker configuration
│
├── event-recommendation/            # Hệ thống gợi ý sự kiện - Python Flask
│   ├── recommend.py                # API Flask chính cho hệ thống gợi ý
│   ├── clean_event_views.py        # Script xử lý dữ liệu event views
│   ├── requirements.txt            # Python dependencies
│   ├── event_views.csv             # Dữ liệu gốc lịch sử xem sự kiện
│   ├── event_views_cleaned.csv     # Dữ liệu đã làm sạch
│   ├── event_views_temp.csv        # Dữ liệu tạm thời
│   └── venv/                       # Môi trường ảo Python
│
└── README.md                       # Tài liệu tổng quan dự án
```

## **Tính năng nổi bật**

### **1. Quản lý sự kiện**

- **Tạo sự kiện:** Ban tổ chức có thể dễ dàng tạo mới sự kiện với đầy đủ thông tin như tên, mô tả, thời gian, địa điểm, loại sự kiện, hình ảnh minh họa, v.v.
- **Chỉnh sửa & xuất bản:** Cho phép cập nhật thông tin sự kiện bất kỳ lúc nào trước khi xuất bản. Sự kiện chỉ hiển thị công khai khi được xuất bản.
- **Tìm kiếm & phân loại:** Hỗ trợ tìm kiếm sự kiện theo tên, loại, thời gian, trạng thái, đồng thời phân loại sự kiện theo các tiêu chí khác nhau.
- **Xem chi tiết:** Người dùng có thể xem chi tiết từng sự kiện, bao gồm lịch trình, diễn giả, nhà tài trợ, bản đồ địa điểm, và các thông tin liên quan.

### **2. Quản lý vé**

- **Tạo loại vé:** Ban tổ chức có thể tạo nhiều loại vé cho mỗi sự kiện (vé thường, VIP, miễn phí, v.v.) với số lượng, giá bán, quyền lợi khác nhau.
- **Bán vé trực tuyến:** Hệ thống hỗ trợ đặt vé, thanh toán online, gửi vé điện tử qua email hoặc tài khoản người dùng.
- **Kiểm tra & xác nhận vé:** Nhân viên check-in sử dụng mã QR để xác nhận vé tại cổng vào sự kiện, đảm bảo kiểm soát chính xác số lượng người tham dự.
- **Thống kê vé:** Theo dõi số lượng vé đã bán, còn lại, doanh thu từ vé, xuất báo cáo chi tiết.

### **3. Quản lý đội nhóm & phân quyền**

- **Phân công vai trò:** Ban tổ chức có thể mời thành viên vào sự kiện và phân công các vai trò như quản lý vé, hỗ trợ sự kiện, check-in, v.v.
- **Quản lý thành viên:** Theo dõi hoạt động, phân quyền truy cập và nhiệm vụ cho từng thành viên trong đội nhóm.

### **4. Quản lý nhà tài trợ & diễn giả**

- **Thêm & chỉnh sửa:** Dễ dàng thêm mới, cập nhật thông tin nhà tài trợ, diễn giả cho từng sự kiện.
- **Hiển thị nổi bật:** Thông tin nhà tài trợ, diễn giả được trình bày nổi bật trên trang sự kiện, giúp tăng giá trị truyền thông.

### **5. Quản lý người dùng**

- **Đăng ký & đăng nhập:** Hỗ trợ đăng ký tài khoản, xác thực email, đăng nhập an toàn bằng JWT.
- **Quên mật khẩu:** Cho phép người dùng lấy lại mật khẩu qua email.
- **Chỉnh sửa hồ sơ:** Người dùng có thể cập nhật thông tin cá nhân, ảnh đại diện, mật khẩu, v.v.

### **6. Thông báo & chat nội bộ**

- **Thông báo sự kiện:** Gửi thông báo tự động đến người dùng về các cập nhật, thay đổi, nhắc nhở liên quan đến sự kiện.
- **Chat nhóm:** Hỗ trợ nhắn tin nội bộ giữa các thành viên trong sự kiện, giúp phối hợp công việc hiệu quả.

### **7. Báo cáo & thống kê**

- **Thống kê doanh thu:** Theo dõi doanh thu từ bán vé, tài trợ, các nguồn thu khác.
- **Báo cáo sự kiện:** Xuất báo cáo về số lượng sự kiện, số người tham dự, hiệu quả từng sự kiện theo thời gian thực.
- **Biểu đồ trực quan:** Hiển thị dữ liệu thống kê bằng biểu đồ, giúp ban tổ chức dễ dàng đánh giá và ra quyết định.

### **8. Quản trị hệ thống (dành cho Admin)**

- **Quản lý người dùng:** Thêm, xóa, khóa tài khoản, phân quyền hệ thống.
- **Quản lý loại sự kiện:** Tạo, chỉnh sửa, xóa các loại sự kiện để chuẩn hóa dữ liệu.
- **Kiểm soát hoạt động:** Theo dõi nhật ký hoạt động, phát hiện và xử lý các vấn đề bảo mật.

### **9. Gợi ý sự kiện cá nhân hóa**

- **Đề xuất sự kiện:** Hệ thống sử dụng mô hình học máy để gợi ý các sự kiện phù hợp với sở thích, lịch sử tham gia, hành vi của từng người dùng.
- **Cá nhân hóa trải nghiệm:** Giúp người dùng dễ dàng tìm thấy các sự kiện phù hợp, tăng tỷ lệ tham gia và sự hài lòng.

## **Vai trò người dùng**

- **ADMIN:** Quản trị toàn bộ hệ thống, quản lý người dùng, vai trò, loại sự kiện.
- **ORGANIZER (Ban tổ chức):** Tạo, quản lý sự kiện, phân công vai trò, xem báo cáo, quản lý đội nhóm, vé, tài trợ, diễn giả.
- **TICKET MANAGER:** Quản lý, kiểm tra, xác nhận vé cho sự kiện.
- **EVENT ASSISTANT:** Hỗ trợ tổ chức sự kiện, quản lý một số tác vụ được phân công.
- **CHECK-IN STAFF:** Quét mã QR, xác nhận vé tại sự kiện.
- **ATTENDEE (Người tham dự):** Đăng ký, mua vé, xem thông tin sự kiện, nhận thông báo, lưu sự kiện yêu thích.

## **Kiến trúc hệ thống**

- **Frontend:** ReactJS, sử dụng các thư viện UI như MUI, Bootstrap, Chart.js, i18next (đa ngôn ngữ), React Router, Axios, v.v.
- **Backend:** Spring Boot (Java 21), Spring Security, Spring Data JPA, WebSocket, MapStruct, Lombok, H2 Database (dev), RESTful API, JWT.
- **Recommendation Service:** Python Flask, sử dụng mô hình SVD (Surprise), Pandas, Scikit-surprise, Numpy, phục vụ gợi ý sự kiện cá nhân hóa.
- **Triển khai:** Docker (backend), serve static (frontend), có thể deploy độc lập từng thành phần.

## **Hướng dẫn triển khai**

### **Backend (Spring Boot)**

### **Yêu cầu:**

- Java 21 trở lên
- Maven 3.9+ (hoặc dùng script mvnw có sẵn)

```sql
cd event-management-backend
# Nếu lần đầu, cấp quyền thực thi cho script (Linux/Mac)
chmod +x mvnw
# Chạy ứng dụng
./mvnw spring-boot:run
# Hoặc trên Windows
mvnw.cmd spring-boot:run
```

- Ứng dụng sẽ chạy tại địa chỉ: [http://localhost:8080](http://localhost:8080/)

### **Frontend (ReactJS)**

**Yêu cầu:**

- Node.js 22.x
- npm 10.x

```sql
cd event-management-frontend
npm install
npm start
```

- Ứng dụng sẽ chạy tại: http://localhost:3000
- Để build production: npm run build
- Để serve production build: npx serve -s build

## **Recommendation Service (Python Flask)**

### **Yêu cầu:**

- Python 3.10+
- pip

```sql
cd event-recommendation
python -m venv venv
# Kích hoạt môi trường ảo:
# Trên Windows:
venv\Scripts\activate
# Trên Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python recommend.py
```

- Service Flask sẽ chạy tại: http://localhost:5000 (hoặc cổng được cấu hình trong code)
- Đảm bảo backend Spring Boot đang chạy để hệ thống gợi ý có thể truy cập API sự kiện.

## **Thư mục dự án**

- event-management-frontend/: Source code giao diện người dùng (ReactJS)
- event-management-backend/: Source code backend (Spring Boot)
- event-recommendation/: Source code hệ thống gợi ý sự kiện (Python Flask)
