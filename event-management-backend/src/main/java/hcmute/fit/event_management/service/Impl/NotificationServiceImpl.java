package hcmute.fit.event_management.service.Impl;

import hcmute.fit.event_management.dto.EventDTO;
import hcmute.fit.event_management.dto.NotificationDTO;
import hcmute.fit.event_management.dto.OrganizerDTO;
import hcmute.fit.event_management.dto.UserDTO;
import hcmute.fit.event_management.entity.Notification;
import hcmute.fit.event_management.entity.User;
import hcmute.fit.event_management.repository.NotificationRepository;
import hcmute.fit.event_management.repository.UserRepository;
import hcmute.fit.event_management.service.EmailService;
import hcmute.fit.event_management.service.FollowService;
import hcmute.fit.event_management.service.NotificationService;
import hcmute.fit.event_management.service.OrganizerService;
import org.springframework.beans.BeanUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import payload.Response;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final FollowService followService;
    private final EmailService emailService;
    private final OrganizerService organizerService;
    private final UserRepository userRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                   UserRepository userRepository, FollowService followService,
                                   EmailService emailService, OrganizerService organizerService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.followService = followService;
        this.emailService = emailService;
        this.organizerService = organizerService;
    }

    @Override
    public Notification createNotification(String title, String message, int userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        Notification notification = new Notification();

        notification.setTitle(title);
        notification.setMessage(message + " was successfully created");
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

    @Override
    public void sendNotification(ResponseEntity<Response> response) {
        // Get created event
        EventDTO createdEvent = (EventDTO) response.getBody().getData();
        // Get Organizer's ID
        OrganizerDTO organizer = organizerService.getOrganizerInforByEventHost(createdEvent.getEventHost());
        if (organizer != null && organizer.getOrganizerId() > 0 && "public".equals(createdEvent.getEventStatus())) {
            List<User> followers = followService.getFollowers(organizer.getOrganizerId());
            List<UserDTO> followersDTO = new ArrayList<>();
            for (User user : followers) {
                UserDTO userDTO = new UserDTO();
                BeanUtils.copyProperties(user, userDTO);
                followersDTO.add(userDTO);
            }
            // Send email to each follower only if event is public
            String eventUrl = "http://localhost:3000/event/" + createdEvent.getEventId();
            String eventLocation = createdEvent.getEventLocation().getVenueName() + ", " +
                    createdEvent.getEventLocation().getAddress() + ", " +
                    createdEvent.getEventLocation().getCity();
            for (UserDTO follower : followersDTO) {
                try {
                    emailService.sendNewEventNotification(
                            follower.getEmail(),
                            createdEvent.getEventName(),
                            createdEvent.getEventStart().toString(),
                            eventLocation,
                            eventUrl
                    );
                } catch (Exception e) {
                    System.err.println("Failed to send email to " + follower.getEmail() + ": " + e.getMessage());
                }
            }
        }
    }
}