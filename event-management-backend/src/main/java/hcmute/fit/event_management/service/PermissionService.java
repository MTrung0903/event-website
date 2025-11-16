package hcmute.fit.event_management.service;

import hcmute.fit.event_management.dto.PermissionDTO;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import payload.Response;

import java.util.List;

public interface PermissionService {
    @Transactional
    ResponseEntity<Response> createPermission(PermissionDTO permissionDTO);

    List<PermissionDTO> getAllPermissions();

    ResponseEntity<Response> updatePermission(PermissionDTO permissionDTO);

    ResponseEntity<Response> deletePermission(String permissionName);
}
