package hcmute.fit.event_management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "event")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_id")
    private int eventID;

    private String eventName;
    @Column(columnDefinition = "TEXT")
    private String eventDesc;
    @ManyToOne
    @JoinColumn(name = "event_type_id", nullable = false)
    private EventType eventType;
    private String eventHost;
    private String eventStatus;
    private LocalDateTime eventStart;
    private LocalDateTime eventEnd;
    @Embedded
    private EventLocation eventLocation;
    private String tags;
    private String eventVisibility;
    private LocalDateTime publishTime;
    private String refunds;
    private int validityDays;

    @ElementCollection
    private List<String> eventImages;
    @Column(columnDefinition = "TEXT")
    private String textContent;

    @ElementCollection
    private List<String> mediaContent;
    private String seatingMapImage;

    @Column(columnDefinition = "TEXT")
    private String seatingLayout; // Thêm trường mới

    @ElementCollection
    private List<String> seatingMapImageVersions = new ArrayList<>(); // Thêm trường mới

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Segment> segments;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Ticket> tickets;

    @OneToMany(mappedBy = "event",cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SponsorEvent> sponsorEvents;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "event",cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Booking> bookings;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FavoriteEvent> favoritedByUsers;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AssignedRole> assignedRoles;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EventView> eventViews;
}
