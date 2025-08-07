package hcmute.fit.event_management.repository;

import hcmute.fit.event_management.entity.Message;
import hcmute.fit.event_management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {
    @Query("SELECT m FROM Message m WHERE " +
            "(m.sender.userId = :user1Id AND m.recipient.userId = :user2Id) OR " +
            "(m.sender.userId = :user2Id AND m.recipient.userId = :user1Id) " +
            "ORDER BY m.timestamp ASC")
    List<Message> findChatHistoryBetweenUsers(
            @Param("user1Id") int user1Id,
            @Param("user2Id") int user2Id);

    @Query("SELECT m FROM Message m WHERE " +
            "(m.sender.userId = :userId1 AND m.recipient.userId = :userId2) OR " +
            "(m.sender.userId = :userId2 AND m.recipient.userId = :userId1) " +
            "ORDER BY m.timestamp")
    List<Message> findChatHistory(@Param("userId1") int userId1, @Param("userId2") int userId2);

    @Query("SELECT DISTINCT m.sender FROM Message m WHERE m.recipient.userId = :userId " +
            "UNION " +
            "SELECT DISTINCT m.recipient FROM Message m WHERE m.sender.userId = :userId")
    List<User> findUsersChattedWith(@Param("userId") int userId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.recipient.userId = :recipientId " +
            "AND m.sender.userId = :senderId AND m.isRead = false")
    long countUnreadMessages(@Param("recipientId") int recipientId, @Param("senderId") int senderId);
}