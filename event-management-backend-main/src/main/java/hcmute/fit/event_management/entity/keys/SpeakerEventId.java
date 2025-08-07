package hcmute.fit.event_management.entity.keys;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpeakerEventId {
    @Column(name = "speaker_id")
    private int speakerId;

    @Column(name = "event_id")
    private int eventId;
}
