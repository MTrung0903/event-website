package hcmute.fit.event_management.dto.responses;


import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse implements Serializable {

    private int userId;
    private String fullName;
    private String email;
    private String gender;
    private LocalDate birthday;
    private String address;


}
