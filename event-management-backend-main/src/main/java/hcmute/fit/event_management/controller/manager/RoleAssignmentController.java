package hcmute.fit.event_management.controller.manager;

import hcmute.fit.event_management.dto.*;
import hcmute.fit.event_management.entity.Event;
import hcmute.fit.event_management.repository.AssignedRoleRepository;
import hcmute.fit.event_management.service.IEventService;
import hcmute.fit.event_management.service.IRoleAssignmentService;
import hcmute.fit.event_management.service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import payload.Response;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/role-assignment")
public class RoleAssignmentController {
    @Autowired
    private IRoleAssignmentService roleAssignmentService;

    @Autowired
    private IEventService  eventService;

    @PostMapping("/assign-role")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<Response> assignRole(@RequestBody AssignRoleRequestDTO assignRoleRequest) {
        return roleAssignmentService.assignRoleToEvent(assignRoleRequest.getEmail(),assignRoleRequest.getRoleId(),assignRoleRequest.getEventId());
    }

    @GetMapping("/team/{userId}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<List<AssignedRoleDTO>> getRoleAssignInEvent(@PathVariable int userId) {
        List<AssignedRoleDTO> list = roleAssignmentService.getRoleAssignInEvent(userId);

        return ResponseEntity.ok(list);
    }

    @GetMapping("/{userId}/my-assigned-events")
    @PreAuthorize("hasAnyRole('ORGANIZER','ATTENDEE')")
    public ResponseEntity<List<EventsJoinedDTO>> getAssignedEvents(@PathVariable int userId) {
        List<AssignedEventDTO> list = roleAssignmentService.getAssignedEvents(userId);
        List<EventsJoinedDTO> events = new ArrayList<>();
        for (AssignedEventDTO event : list) {
            EventsJoinedDTO eventDTO = new EventsJoinedDTO();
            eventDTO.setEvent(eventService.getEventById(event.getEventId()));
            eventDTO.setRoleName(event.getRoleName());
            eventDTO.setPermissions(event.getPermissions());
            events.add(eventDTO);
        }
        return ResponseEntity.ok(events);
    }
    @GetMapping("/{eventId}/my-team-events")
    @PreAuthorize("hasAnyRole('ORGANIZER','ATTENDEE')")
    public ResponseEntity<AssignedEventTeamDTO> getTeamInEvent(@PathVariable int eventId) {
        return ResponseEntity.ok(roleAssignmentService.getTeam(eventId));
    }
    @GetMapping("/{userId}/get-events")
    public ResponseEntity<Set<EventDTO>> getEvents(@PathVariable int userId) {
        List<AssignedEventDTO> list = roleAssignmentService.getAssignedEvents(userId);
        List<EventDTO> events = new ArrayList<>();
        for (AssignedEventDTO event : list) {
            EventDTO eventDTO = eventService.getEventById(event.getEventId());
            events.add(eventDTO);
        }
        List<EventDTO> eventDTOs = eventService.getEventsByUSer(userId);
        Set<EventDTO> finalEvents = new HashSet<>();
        for (EventDTO event : eventDTOs) {
            finalEvents.add(event);
        }
        for (EventDTO event : events){
            finalEvents.add(event);
        }
        return ResponseEntity.ok(finalEvents);
    }
    @DeleteMapping("delete")
    public ResponseEntity<Boolean> deleteAssignedRole(@RequestParam int userId, @RequestParam int roleId, @RequestParam int eventId) {
        return ResponseEntity.ok(roleAssignmentService.deleteAssignedRole(userId, eventId,roleId));
    }
}
