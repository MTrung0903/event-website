package hcmute.fit.event_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SpeakerDTO {
    private int speakerId;
    private String speakerName;
    private String speakerImage;
    private String speakerEmail;
    private String speakerPhone;
    private String speakerDesc;
    private String speakerExperience;
    private String speakerSocialMedia;
    private String speakerStatus;
}
