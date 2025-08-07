package hcmute.fit.event_management.entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private int userId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "gender")
    private String gender;

    @Column(name = "birthday")
    private LocalDate birthday;

    @Column(name = "address")
    private String address;

    @Column(name = "is_active")
    private boolean isActive;

    @ElementCollection
    @CollectionTable(name = "user_preferred_event_types", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "event_type")
    private List<String> preferredEventTypes;

    @ElementCollection
    @CollectionTable(name = "user_preferred_tags", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "tag")
    private List<String> preferredTags;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Notification> listNoti;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Booking> listBooking;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @PrimaryKeyJoinColumn
    private PasswordResetToken token;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<UserRole> listUserRoles;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Organizer organizer;
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Event> events;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FavoriteEvent> favoriteEvents;

    @OneToMany(mappedBy = "follower", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Follow> follows;
}
