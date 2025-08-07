package hcmute.fit.event_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AssignedEventDTO {
    private int eventId;
    private String eventName;
    private String roleName;
    private List<String> permissions;
}