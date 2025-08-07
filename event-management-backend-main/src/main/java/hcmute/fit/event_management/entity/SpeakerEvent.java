package hcmute.fit.event_management.entity;

import hcmute.fit.event_management.entity.keys.SpeakerEventId;
import hcmute.fit.event_management.entity.keys.SponsorEventId;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "speaker_event")
public class SpeakerEvent {
    @EmbeddedId
    private SpeakerEventId id;

    @ManyToOne
    @MapsId("speaker_id")
    @JoinColumn(name = "speaker_id", referencedColumnName = "speaker_id", nullable = false)
    private Speaker speaker;

    @ManyToOne
    @MapsId("event_id")
    @JoinColumn(name = "event_id", referencedColumnName = "event_id", nullable = false)
    private Event event;
}
