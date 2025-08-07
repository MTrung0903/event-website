package hcmute.fit.event_management.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoleDTO {
    private int roleID;
    private String name;
    private String createdBy;
    private List<PermissionDTO> permissions;
}