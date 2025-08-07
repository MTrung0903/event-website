package hcmute.fit.event_management.dto;



import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private int userId;
    private String fullName;
    private String email;
    private String password;
    private String gender;
    private int unreadCount;
    private LocalDate birthday;
    private String address;
    private boolean isActive;
    private List<RoleDTO> roles;
    private OrganizerDTO organizer;
    private List<String> preferredEventTypes;
    private List<String> preferredTags;
}
