package hcmute.fit.event_management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_views")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class EventView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user; // Có thể null nếu người dùng không đăng nhập

    @Column(name = "view_timestamp", nullable = false)
    private LocalDateTime viewTimestamp;

}
