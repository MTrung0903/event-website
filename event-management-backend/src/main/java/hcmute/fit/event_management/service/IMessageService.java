package hcmute.fit.event_management.service;

import hcmute.fit.event_management.dto.MessageDTO;
import hcmute.fit.event_management.dto.UserDTO;
import hcmute.fit.event_management.entity.Message;

import java.util.List;

public interface IMessageService {

    Message createMessage(MessageDTO messageDTO);

    List<MessageDTO> getChatHistory(int user1Id, int user2Id);

    MessageDTO convertToDTO(Message message);

    List<UserDTO> getListUserChat(int userId);

    void markMessagesAsRead(int recipientId, int senderId);

    int getUserIdByEmail(String email);

    boolean hasChatHistory(int user1Id, int user2Id);
}
