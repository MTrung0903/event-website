package hcmute.fit.event_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
public class MessageDTO {
    private String content;
    private String senderEmail;
    private String recipientEmail;
    private String timestamp;
    private boolean isRead;
    private String mediaUrl;
    private String contentType; // "TEXT", "EMOJI", "IMAGE", "VIDEO"

    public MessageDTO() {}
    public MessageDTO(String content, String senderEmail, String recipientEmail, String timestamp, boolean isRead, String mediaUrl, String contentType) {
        this.content = content;
        this.senderEmail = senderEmail;
        this.recipientEmail = recipientEmail;
        this.timestamp = timestamp;
        this.isRead = isRead;
        this.mediaUrl = mediaUrl;
        this.contentType = contentType;
    }
}