package hcmute.fit.event_management.service;

import hcmute.fit.event_management.dto.PermissionDTO;
import hcmute.fit.event_management.dto.RoleDTO;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import payload.Response;

import java.util.List;

public interface IRoleService {
    @Transactional
    ResponseEntity<Response> createRole(RoleDTO roleDTO);

    ResponseEntity<Response> updateRole(RoleDTO roleDTO);

    ResponseEntity<Response> deleteRole(String roleName);

    @Transactional
    ResponseEntity<Response> assignPermissionsToRole(int roleId, List<String> permissionNames);

    List<RoleDTO> getAllRoles();

    List<RoleDTO> getAllRolesByCreated(String created);

    RoleDTO getRoleById(int roleId);


    List<RoleDTO> getRolesCanAssigned();
}
