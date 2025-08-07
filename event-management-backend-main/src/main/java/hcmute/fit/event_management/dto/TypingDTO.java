package hcmute.fit.event_management.dto;

import lombok.Data;

@Data
public class TypingDTO {
    private String senderEmail;
    private String recipientEmail;
    private boolean isTyping;
}
