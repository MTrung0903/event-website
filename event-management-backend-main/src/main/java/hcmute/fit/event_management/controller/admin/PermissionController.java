package hcmute.fit.event_management.controller.admin;

import hcmute.fit.event_management.dto.PermissionDTO;
import hcmute.fit.event_management.service.IPermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import payload.Response;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
public class PermissionController {
    @Autowired
    private IPermissionService permissionService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Response> createPermission(@RequestBody PermissionDTO permissionDTO) {
        return permissionService.createPermission(permissionDTO);
    }
    @GetMapping()
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    public ResponseEntity<List<PermissionDTO>> getAllPermissions() {
        List<PermissionDTO> list =  permissionService.getAllPermissions();
        return ResponseEntity.ok(list);
    }
    @PutMapping("update")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<Response> updatePermission( @RequestBody PermissionDTO permissionDTO) {
        return permissionService.updatePermission(permissionDTO);
    }
    @DeleteMapping("delete/{name}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Response> deletePermission(@PathVariable String name) {
        return permissionService.deletePermission(name);
    }
}
