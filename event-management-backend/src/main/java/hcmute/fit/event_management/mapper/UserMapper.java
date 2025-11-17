package hcmute.fit.event_management.mapper;

import com.cloudinary.Cloudinary;
import hcmute.fit.event_management.dto.OrganizerDTO;
import hcmute.fit.event_management.dto.PermissionDTO;
import hcmute.fit.event_management.dto.RoleDTO;
import hcmute.fit.event_management.dto.UserDTO;
import hcmute.fit.event_management.entity.Permission;
import hcmute.fit.event_management.entity.Role;
import hcmute.fit.event_management.entity.User;
import hcmute.fit.event_management.entity.UserRole;
import lombok.AllArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class UserMapper {
    private final Cloudinary cloudinary;

    public UserDTO toDto(User user, Optional<List<UserRole>> userRolesOpt) {
        UserDTO userDTO = new UserDTO();
        BeanUtils.copyProperties(user, userDTO);

        // Map Organizer
        if (user.getOrganizer() != null) {
            OrganizerDTO organizerDTO = new OrganizerDTO();
            BeanUtils.copyProperties(user.getOrganizer(), organizerDTO);
            String urlImage = cloudinary.url().generate(user.getOrganizer().getOrganizerLogo());
            organizerDTO.setOrganizerLogo(urlImage);
            userDTO.setOrganizer(organizerDTO);
        }

        // Map Roles and Permissions
        List<RoleDTO> roleDTOs = new ArrayList<>();
        if (userRolesOpt.isPresent()) {
            for (UserRole userRole : userRolesOpt.get()) {
                Role role = userRole.getRole();
                RoleDTO roleDTO = new RoleDTO();
                roleDTO.setRoleID(role.getRoleId());
                roleDTO.setName(role.getName());
                roleDTO.setCreatedBy(role.getCreatedBy());

                // Map Permissions
                List<PermissionDTO> permissionDTOs = new ArrayList<>();
                if (role.getPermissions() != null) {
                    for (Permission permission : role.getPermissions()) {
                        PermissionDTO permissionDTO = new PermissionDTO();
                        permissionDTO.setName(permission.getName());
                        permissionDTO.setDescription(permission.getDescription());
                        permissionDTOs.add(permissionDTO);
                    }
                }
                roleDTO.setPermissions(permissionDTOs);
                roleDTOs.add(roleDTO);
            }
        }
        userDTO.setRoles(roleDTOs);
        return userDTO;
    }
}
