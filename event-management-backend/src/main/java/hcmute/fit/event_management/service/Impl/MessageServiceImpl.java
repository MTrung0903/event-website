package hcmute.fit.event_management.service.Impl;

import hcmute.fit.event_management.dto.MessageDTO;
import hcmute.fit.event_management.dto.UserDTO;
import hcmute.fit.event_management.entity.Message;
import hcmute.fit.event_management.entity.User;
import hcmute.fit.event_management.repository.MessageRepository;
import hcmute.fit.event_management.repository.UserRepository;
import hcmute.fit.event_management.service.IMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageServiceImpl implements IMessageService {
    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Message createMessage(MessageDTO messageDTO) {
        User sender = userRepository.findByEmail(messageDTO.getSenderEmail())
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User recipient = userRepository.findByEmail(messageDTO.getRecipientEmail())
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        Message message = new Message();
        message.setSender(sender);
        message.setRecipient(recipient);
        message.setContent(messageDTO.getContent());
        message.setMediaUrl(messageDTO.getMediaUrl());
        message.setContentType(messageDTO.getContentType());
        message.setTimestamp(parseTimestamp(messageDTO.getTimestamp()));
        message.setRead(false);
        return messageRepository.save(message);
    }

    private LocalDateTime parseTimestamp(String timestamp) {
        try {
            ZonedDateTime zonedDateTime = ZonedDateTime.parse(timestamp, DateTimeFormatter.ISO_DATE_TIME);
            ZonedDateTime localTime = zonedDateTime.withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"));
            LocalDateTime localDateTime = localTime.toLocalDateTime();
            return localDateTime;
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid timestamp format: " + timestamp, e);
        }
    }

    @Override
    public List<MessageDTO> getChatHistory(int user1Id, int user2Id) {
        List<Message> messages = messageRepository.findChatHistoryBetweenUsers(user1Id, user2Id);
        return messages.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public MessageDTO convertToDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setContent(message.getContent());
        dto.setSenderEmail(message.getSender().getEmail());
        dto.setRecipientEmail(message.getRecipient().getEmail());
        dto.setMediaUrl(message.getMediaUrl());
        dto.setContentType(message.getContentType());
        ZonedDateTime zonedDateTime = message.getTimestamp().atZone(ZoneId.of("Asia/Ho_Chi_Minh"));
        dto.setTimestamp(zonedDateTime.format(DateTimeFormatter.ISO_INSTANT));
        dto.setRead(message.isRead());
        return dto;
    }

    @Override
    public List<UserDTO> getListUserChat(int userId) {
        try {
            if (!userRepository.existsById(userId)) {
                throw new IllegalArgumentException("User not found: " + userId);
            }

            List<User> chattedUsers = messageRepository.findUsersChattedWith(userId);
            List<UserDTO> userDTOs = chattedUsers.stream()
                    .filter(user -> user.getUserId() != userId)
                    .map(user -> {
                        UserDTO userDTO = new UserDTO();
                        userDTO.setUserId(user.getUserId());
                        userDTO.setEmail(user.getEmail() != null ? user.getEmail() : "");
                        userDTO.setFullName(user.getFullName() != null ? user.getFullName() : "");
                        // Calculate unread messages for this user
                        long unreadCount = messageRepository.countUnreadMessages(userId, user.getUserId());
                        userDTO.setUnreadCount((int) unreadCount);
                        return userDTO;
                    })
                    .collect(Collectors.toList());

            return userDTOs;
        } catch (DataAccessException e) {
            throw new RuntimeException("Failed to fetch chatted users due to database error", e);
        } catch (Exception e) {
            throw new RuntimeException("Unexpected error occurred", e);
        }
    }

    @Override
    public void markMessagesAsRead(int recipientId, int senderId) {
        List<Message> messages = messageRepository.findChatHistoryBetweenUsers(recipientId, senderId);
        messages.stream()
                .filter(m -> m.getRecipient().getUserId() == recipientId && !m.isRead())
                .forEach(m -> {
                    m.setRead(true);
                    messageRepository.save(m);
                });
    }

    @Override
    public int getUserIdByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return user.getUserId();
    }

    @Override
    public boolean hasChatHistory(int user1Id, int user2Id) {
        List<Message> messages = messageRepository.findChatHistoryBetweenUsers(user1Id, user2Id);
        return !messages.isEmpty();
    }
}