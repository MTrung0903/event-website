package hcmute.fit.event_management.service;

import hcmute.fit.event_management.dto.AssignedEventDTO;
import hcmute.fit.event_management.dto.AssignedEventTeamDTO;
import hcmute.fit.event_management.dto.AssignedRoleDTO;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import payload.Response;

import java.util.List;

public interface IRoleAssignmentService {
    @Transactional
    ResponseEntity<Response> assignRoleToEvent(String email, int roleId, int eventId);

    List<AssignedRoleDTO> getRoleAssignInEvent(int organizerId);



    List<AssignedEventDTO> getAssignedEvents(int userId);

    AssignedEventTeamDTO getTeam(int eventId);

    boolean deleteAssignedRole(int userId, int eventId, int roleId);
}
