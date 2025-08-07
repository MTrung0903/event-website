package hcmute.fit.event_management.controller.guest;

import hcmute.fit.event_management.dto.NotificationDTO;
import hcmute.fit.event_management.entity.Notification;
import hcmute.fit.event_management.repository.UserRepository;
import hcmute.fit.event_management.service.INotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class NotificationController {
    @Autowired
    private SimpMessagingTemplate template;

    @Autowired
    private INotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @MessageMapping("/private")
    public void sendToSpecificUser(@Payload NotificationDTO notificationDTO) {
        try {
            // Kiểm tra người dùng tồn tại
            if (!userRepository.existsById(notificationDTO.getUserId())) {
                System.out.println("User not found with ID: " + notificationDTO.getUserId());
                return;
            }
            // Lưu thông báo
            Notification savedNotification = notificationService.createNotification(notificationDTO);

            // Gửi thông báo tới người dùng cụ thể
            template.convertAndSendToUser(
                    String.valueOf(notificationDTO.getUserId()),
                    "/specific",
                    notificationDTO
            );

            System.out.println("Sent notification to user " + notificationDTO.getUserId() + ": " + notificationDTO.getMessage());
        } catch (Exception e) {
            System.out.println("Failed to send notification: " + e.getMessage());
        }
    }

}