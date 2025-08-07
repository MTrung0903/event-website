package hcmute.fit.event_management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PasswordResetToken {
    @Id
    @Column(name = "user_id")
    private int userId;
    @Column(name = "token")
    private String token;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

}
