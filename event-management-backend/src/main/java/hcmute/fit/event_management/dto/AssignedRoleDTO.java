package hcmute.fit.event_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AssignedRoleDTO {
    private String email;
    private String roleName;
    private int eventId;
    private String eventName;
}
