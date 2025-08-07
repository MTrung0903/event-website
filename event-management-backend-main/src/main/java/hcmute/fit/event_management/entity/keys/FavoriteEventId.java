package hcmute.fit.event_management.entity.keys;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FavoriteEventId implements java.io.Serializable {
    @Column(name = "user_id")
    private int userId;

    @Column(name = "event_id")
    private int eventId;
}