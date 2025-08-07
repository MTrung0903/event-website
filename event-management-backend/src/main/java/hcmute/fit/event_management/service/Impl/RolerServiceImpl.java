package hcmute.fit.event_management.service.Impl;

import hcmute.fit.event_management.dto.PermissionDTO;
import hcmute.fit.event_management.dto.RoleDTO;
import hcmute.fit.event_management.entity.Permission;
import hcmute.fit.event_management.entity.Role;
import hcmute.fit.event_management.repository.PermissionRepository;
import hcmute.fit.event_management.repository.RoleRepository;
import hcmute.fit.event_management.service.IRoleService;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import payload.Response;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class RolerServiceImpl implements IRoleService {
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private PermissionRepository permissionRepository;

    Logger logger = LoggerFactory.getLogger(this.getClass());

    @Transactional
    @Override
    public ResponseEntity<Response> createRole(RoleDTO roleDTO) {
        //Kiểm tra xem role đã tồn tại chưa
        Optional<Role> existingRole = roleRepository.findByName(roleDTO.getName());
        if (existingRole.isPresent()) {
            logger.warn("Role creation failed: Name {} already exists", roleDTO.getName());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new Response(409, "Conflict", "Role name already exists"));
        }

        // tạo role mới nếu role chưa tồn tại
        Role role = new Role();
        role.setName(roleDTO.getName().toUpperCase());
        role.setCreatedBy("ADMIN");
        roleRepository.save(role);

        logger.info("Role {} created successfully", roleDTO.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new Response(201, "Success", "Role created successfully"));
    }

    @Override
    public ResponseEntity<Response> updateRole(RoleDTO roleDTO) {
        Optional<Role> existingRole = roleRepository.findById(roleDTO.getRoleID());
        if (!existingRole.isPresent()) {
            logger.warn("Role not found {}", roleDTO.getName());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new Response(404, "Not Found", "Role not found"));
        }

        Role role = existingRole.get();

        role.setName(roleDTO.getName().toUpperCase());

        List<Permission> permissions = new ArrayList<>();
        if (roleDTO.getPermissions() != null) {
            for (PermissionDTO permissionDTO : roleDTO.getPermissions()) {
                Optional<Permission> permOpt = permissionRepository.findByName(permissionDTO.getName());
                if (permOpt.isEmpty()) {
                    logger.warn("Permission {} not found", permissionDTO.getName());
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(new Response(404, "Not Found", "Permission " + permissionDTO.getName() + " not found"));
                }
                permissions.add(permOpt.get());
            }
        }
        role.setPermissions(permissions);
        roleRepository.save(role);

        logger.info("Role {} updated successfully", roleDTO.getName());
        return ResponseEntity.status(HttpStatus.OK)
                .body(new Response(200, "Success", "Role updated successfully"));
    }

    @Override
    public ResponseEntity<Response> deleteRole(String roleName) {
        Optional<Role> existingRole = roleRepository.findByName(roleName);
        if (!existingRole.isPresent()) {
            logger.warn("Role not found {}", roleName);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new Response(404, "Not Found", "Role not found"));
        }

        Role role = existingRole.get();
        if (!role.getListUserRoles().isEmpty()) {
            logger.warn("Role {} is assigned to users", roleName);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new Response(400, "Bad Request", "Role is assigned to users"));
        }

        roleRepository.delete(role);
        logger.info("Role {} deleted successfully", roleName);
        return ResponseEntity.status(HttpStatus.OK)
                .body(new Response(200, "Success", "Role deleted successfully"));
    }

    @Transactional
    @Override
    public ResponseEntity<Response> assignPermissionsToRole(int roleId, List<String> permissionNames) {
        Optional<Role> roleOpt = roleRepository.findById(roleId);
        if (roleOpt.isEmpty()) {
            logger.warn("Assign permissions failed: Role ID {} not found", roleId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new Response(404, "Not Found", "Role not found"));
        }
        Role role = roleOpt.get();

        List<Permission> currentPermissions = role.getPermissions();
        List<Permission> permissionsToAdd = new ArrayList<>();
        for (String name : permissionNames) {
            Optional<Permission> permOpt = permissionRepository.findByName(name);
            if (permOpt.isEmpty()) {
                logger.warn("Permission {} not found", name);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new Response(404, "Not Found", "Permission " + name + " not found"));
            }
            Permission permission = permOpt.get();
            if (!currentPermissions.contains(permission)) {
                permissionsToAdd.add(permission);
            }
        }

        if (permissionsToAdd.isEmpty()) {
            logger.info("All permissions already assigned to role {}", role.getName());
            return ResponseEntity.ok(new Response(200, "Success", "All permissions already assigned"));
        }

        currentPermissions.addAll(permissionsToAdd);
        role.setPermissions(currentPermissions);
        roleRepository.save(role);

        logger.info("Assigned permissions {} to role {}", permissionNames, role.getName());
        return ResponseEntity.ok(new Response(200, "Success", "Permissions assigned successfully"));
    }

    @Override
    public List<RoleDTO> getAllRoles() {
        List<Role> roles = roleRepository.findAll();
        List<RoleDTO> roleDTOs = new ArrayList<>();
        for (Role role : roles) {
            RoleDTO roleDTO = new RoleDTO();
            roleDTO.setRoleID(role.getRoleId());
            roleDTO.setName(role.getName().toUpperCase());
            roleDTO.setCreatedBy(role.getCreatedBy());
            roleDTO.setPermissions(convertToDTO(role.getPermissions()));
            roleDTOs.add(roleDTO);

        }
        return roleDTOs;
    }

    @Override
    public List<RoleDTO> getAllRolesByCreated(String created) {
        List<Role> roles = roleRepository.findByCreatedBy(created);
        List<RoleDTO> roleDTOs = new ArrayList<>();
        for (Role role : roles) {
            RoleDTO roleDTO = new RoleDTO();
            roleDTO.setRoleID(role.getRoleId());
            roleDTO.setName(role.getName().toUpperCase());

            roleDTO.setPermissions(convertToDTO(role.getPermissions()));
            roleDTOs.add(roleDTO);

        }
        return roleDTOs;
    }
    @Override
    public RoleDTO getRoleById(int roleId) {
        Role roleOpt = roleRepository.findById(roleId).orElse(null);
        RoleDTO roleDTO = new RoleDTO();
        roleDTO.setRoleID(roleOpt.getRoleId());
        roleDTO.setName(roleOpt.getName().toUpperCase());
        roleDTO.setPermissions(convertToDTO(roleOpt.getPermissions()));
        return roleDTO;
    }

   public List<PermissionDTO> convertToDTO(List<Permission> permissions) {
        List<PermissionDTO> permissionDTOs = new ArrayList<>();
        for (Permission permission : permissions) {
            PermissionDTO permissionDTO = new PermissionDTO();
            permissionDTO.setPermissionId(permission.getPermissionId());
            permissionDTO.setName(permission.getName().toUpperCase());
            permissionDTO.setDescription(permission.getDescription());
            permissionDTOs.add(permissionDTO);
        }
        return permissionDTOs;
   }

   @Override
   public List<RoleDTO> getRolesCanAssigned(){
       List<RoleDTO> roles =getAllRoles();
       List<RoleDTO> assignedRoles = new ArrayList<>();
       for (RoleDTO role : roles) {
           if (!("ROLE_ADMIN".equals(role.getName()) ||
                   "ROLE_ORGANIZER".equals(role.getName()) ||
                   "ROLE_ATTENDEE".equals(role.getName()))) {
               assignedRoles.add(role);
           }
       }
       return assignedRoles;
   }
}
