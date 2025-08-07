package hcmute.fit.event_management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "segment")
public class Segment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "segment_id")
    private int segmentId;
    @Column(name = "segment_title")
    private String segmentTitle;
    @Column(name = "segment_description")
    private String segmentDesc;
    @Column(name = "start_time")
    private Date startTime;
    @Column(name = "end_time")
    private Date endTime;

    @ManyToOne
    @JoinColumn(name = "speaker_id")
    private Speaker speaker;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;
}
