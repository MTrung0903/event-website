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
public class SponsorEventId {

    @Column(name = "sponsor_id")
    private int sponsorId;

    @Column(name = "event_id")
    private int eventId;
}
