package hcmute.fit.event_management.controller.guest;

import hcmute.fit.event_management.dto.MessageDTO;

import hcmute.fit.event_management.dto.NotificationDTO;
import hcmute.fit.event_management.dto.TypingDTO;
import hcmute.fit.event_management.service.IMessageService;
import hcmute.fit.event_management.service.INotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import org.springframework.stereotype.Controller;

import java.util.Arrays;
import java.util.Date;

@Controller
public class ChatController {
    @Autowired
    private SimpMessagingTemplate template;

    @Autowired
    private IMessageService messageService;

    @Autowired
    private INotificationService notificationService;

    @MessageMapping("/chat")
    public void sendMessage(@Payload MessageDTO messageDTO) {

        // Validate content type
        if (!Arrays.asList("TEXT", "EMOJI", "IMAGE", "VIDEO").contains(messageDTO.getContentType())) {
            throw new IllegalArgumentException("Invalid content type");
        }
        // Lưu tin nhắn vào cơ sở dữ liệu
        messageService.createMessage(messageDTO);

        // Gửi tin nhắn tới người nhận qua WebSocket
        template.convertAndSendToUser(
                messageDTO.getRecipientEmail(),
                "/chat",
                messageDTO
        );

        // Gửi lại tin nhắn tới người gửi để cập nhật giao diện
        template.convertAndSendToUser(
                messageDTO.getSenderEmail(),
                "/chat",
                messageDTO
        );
        // Create and send notification
        NotificationDTO notificationDTO = new NotificationDTO();
        notificationDTO.setTitle("New Message");
        notificationDTO.setMessage("You have a new message from " + messageDTO.getSenderEmail());
        notificationDTO.setUserId(messageService.getUserIdByEmail(messageDTO.getRecipientEmail()));
        notificationDTO.setRead(false);
        notificationDTO.setCreatedAt(new Date());

        notificationService.createNotification(notificationDTO);
        template.convertAndSendToUser(
                String.valueOf(notificationDTO.getUserId()),
                "/specific",
                notificationDTO
        );
    }
    @MessageMapping("/typing")
    public void sendTypingNotification(@Payload TypingDTO typingDTO) {
        template.convertAndSendToUser(
                typingDTO.getRecipientEmail(),
                "/typing",
                typingDTO
        );
    }
}