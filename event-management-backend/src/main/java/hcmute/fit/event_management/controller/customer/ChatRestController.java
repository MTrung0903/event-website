package hcmute.fit.event_management.controller.customer;

import hcmute.fit.event_management.dto.MessageDTO;
import hcmute.fit.event_management.dto.UserDTO;
import hcmute.fit.event_management.service.MessageService;
import hcmute.fit.event_management.service.UserService;
import hcmute.fit.event_management.service.Impl.CloudinaryServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/chat")
public class ChatRestController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private UserService userService;

    @Autowired
    private CloudinaryServiceImpl cloudinaryServiceImpl;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String publicId = cloudinaryServiceImpl.uploadFile(file);
            System.out.println("Uploaded file to Cloudinary with publicId: " + publicId);
            return new ResponseEntity<>(publicId, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("File upload to Cloudinary failed: " + e.getMessage());
            return new ResponseEntity<>("File upload failed: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/history/{user1Id}/{user2Id}")
    public ResponseEntity<List<MessageDTO>> getChatHistory(
            @PathVariable int user1Id,
            @PathVariable int user2Id) {
        try {
            List<MessageDTO> chatHistory = messageService.getChatHistory(user1Id, user2Id);
            System.out.println("Chat history fetched for users: " + user1Id + ", " + user2Id);
            messageService.markMessagesAsRead(user1Id, user2Id);
            return new ResponseEntity<>(chatHistory, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Failed to fetch chat history: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{userId}/list-chat")
    public ResponseEntity<List<UserDTO>> getChatHistory(@PathVariable int userId) {
        List<UserDTO> chatHistory = messageService.getListUserChat(userId);
        System.out.println("Chat list fetched for user: " + userId);
        return new ResponseEntity<>(chatHistory, HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDTO>> searchUsers(@RequestParam String query, @RequestParam int currentUserId) {
        try {
            List<UserDTO> users = userService.searchUserForChat(query, currentUserId);
            System.out.println("Search users with query: " + query);
            return new ResponseEntity<>(users, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Search failed: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}