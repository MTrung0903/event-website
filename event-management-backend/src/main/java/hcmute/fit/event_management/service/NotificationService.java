package hcmute.fit.event_management.service;

import hcmute.fit.event_management.dto.NotificationDTO;
import hcmute.fit.event_management.entity.Notification;
import org.springframework.http.ResponseEntity;
import payload.Response;

import java.util.List;

public interface NotificationService {
    Notification createNotification(String title, String message, int userId);

    void markAsRead(int notificationId);

    void markAllAsRead(int userId);

    List<NotificationDTO> getAllNotifications(int userId);

    long getUnreadNotificationCount(int userId);

    void sendNotification(ResponseEntity<Response> response);
}
