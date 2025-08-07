package hcmute.fit.event_management.controller.guest;

import hcmute.fit.event_management.dto.NotificationDTO;
import hcmute.fit.event_management.entity.Notification;
import hcmute.fit.event_management.entity.User;
import hcmute.fit.event_management.repository.NotificationRepository;
import hcmute.fit.event_management.repository.UserRepository;
import hcmute.fit.event_management.service.INotificationService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import payload.Response;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/notify")
public class NotificationRestController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private INotificationService notificationService;

    @Autowired
    private SimpMessagingTemplate template;

    @PostMapping("/send")
    public ResponseEntity<String> sendNotification(@RequestBody NotificationDTO notificationDTO) {
        try {
            // Kiểm tra người dùng tồn tại
            if (!userRepository.existsById(notificationDTO.getUserId())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User not found with ID: " + notificationDTO.getUserId());
            }
            // Lưu thông báo vào cơ sở dữ liệu
            notificationService.createNotification(notificationDTO);
            // Gửi thông báo qua WebSocket
            template.convertAndSendToUser(
                    String.valueOf(notificationDTO.getUserId()),
                    "/specific",
                    notificationDTO
            );
            return ResponseEntity.ok("Notification sent successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send notification: " + e.getMessage());
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getNotify(@PathVariable int userId) {
        try {

            List<NotificationDTO> notificationDTOList = notificationService.getAllNotifications(userId);
            Response response = new Response(200, "Success", notificationDTOList);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new Response(400, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new Response(500, "Internal server error", null));
        }
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<String> markNotificationAsRead(@PathVariable int notificationId) {
        try {
            notificationService.markAsRead(notificationId);
            return ResponseEntity.ok("Notification marked as read");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to mark notification as read: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error");
        }
    }

    @PutMapping("/readAll/{userId}")
    public ResponseEntity<String> markAllNotificationAsRead(@PathVariable int userId) {
        try {
            if (!userRepository.existsById(userId)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User not found with ID: " + userId);
            }
            notificationService.markAllAsRead(userId);
            return ResponseEntity.ok("All notifications marked as read");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to mark all notifications as read: " + e.getMessage());
        }
    }
    @GetMapping("/unread-count/{userId}")
    public ResponseEntity<Long> getUnreadNotificationCount(@PathVariable("userId") int userId) {
        long count = notificationService.getUnreadNotificationCount(userId);
        return ResponseEntity.ok(count);
    }
}