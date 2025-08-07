package hcmute.fit.event_management.entity;

import hcmute.fit.event_management.entity.keys.FavoriteEventId;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "favorite_event")
public class FavoriteEvent {
    @EmbeddedId
    private FavoriteEventId id;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @MapsId("eventId")
    @JoinColumn(name = "event_id")
    private Event event;

    @Column(name = "saved_at")
    private LocalDateTime savedAt = LocalDateTime.now();
}
