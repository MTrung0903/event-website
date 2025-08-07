package hcmute.fit.event_management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "speaker")
public class Speaker {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "speaker_id")
    private int speakerId;
    @Column(name = "speaker_image")
    private String speakerImage;
    @Column(name = "speaker_name")
    private String speakerName;
    @Column(name = "speaker_email")
    private String speakerEmail;
    @Column(name = "speaker_phone")
    private String speakerPhone;
    @Column(name = "speaker_desc")
    private String speakerDesc;
    @OneToMany(mappedBy = "speaker",cascade = CascadeType.ALL)
    private List<Segment> segments;
    @OneToMany(mappedBy = "speaker",cascade = CascadeType.ALL)
    private List<SpeakerEvent> speakerEvents;
}