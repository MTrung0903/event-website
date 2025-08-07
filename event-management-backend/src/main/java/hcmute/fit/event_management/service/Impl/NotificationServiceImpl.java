package hcmute.fit.event_management.service.Impl;

import hcmute.fit.event_management.dto.NotificationDTO;
import hcmute.fit.event_management.entity.Notification;
import hcmute.fit.event_management.entity.User;
import hcmute.fit.event_management.repository.NotificationRepository;
import hcmute.fit.event_management.repository.UserRepository;
import hcmute.fit.event_management.service.INotificationService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class NotificationServiceImpl implements INotificationService {
    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Notification createNotification(NotificationDTO notificationDTO) {
        User user = userRepository.findById(notificationDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + notificationDTO.getUserId()));
        Notification notification = new Notification();
        BeanUtils.copyProperties(notificationDTO, notification);
        notification.setRead(false);
        notification.setUser(user);
        notification.setCreatedAt(new Date());
        return notificationRepository.save(notification);
    }

    @Override
    public void markAsRead(int notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + notificationId));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(int userId) {
        notificationRepository.markAllAsRead(userId);
    }
    @Override
    public List<NotificationDTO> getAllNotifications(int userId) {

        List<Notification> listNotify = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<NotificationDTO> notificationDTOList = new ArrayList<>();
        for (Notification notification : listNotify) {
            NotificationDTO notificationDTO = new NotificationDTO();
            BeanUtils.copyProperties(notification, notificationDTO);
            notificationDTO.setId(notification.getNotiId());
            notificationDTO.setUserId(notification.getUser().getUserId());
            notificationDTOList.add(notificationDTO);
        }
        return notificationDTOList;
    }
    @Override
    public long getUnreadNotificationCount(int userId) {
        return notificationRepository.countUnreadNotificationsByUserId(userId);
    }
}