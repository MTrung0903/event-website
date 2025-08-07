package hcmute.fit.event_management.service.Impl;

import hcmute.fit.event_management.dto.*;
import hcmute.fit.event_management.entity.AssignedRole;
import hcmute.fit.event_management.entity.Event;
import hcmute.fit.event_management.entity.Role;
import hcmute.fit.event_management.repository.AssignedRoleRepository;
import hcmute.fit.event_management.repository.EventRepository;
import hcmute.fit.event_management.repository.RoleRepository;
import hcmute.fit.event_management.repository.UserRepository;
import hcmute.fit.event_management.service.IRoleAssignmentService;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import payload.Response;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RoleAssignmentServiceImpl implements IRoleAssignmentService {
    @Autowired
    private AssignedRoleRepository assignedRoleRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private EventRepository eventRepository;
    @Autowired
    private UserServiceImpl userService;
    @Autowired
    private RolerServiceImpl rolerService;
    private static final Logger logger = LoggerFactory.getLogger(RoleAssignmentServiceImpl.class);
    @Transactional
    @Override
    public ResponseEntity<Response> assignRoleToEvent(String email, int roleId, int eventId) {
        UserDTO userDTO = userService.getInfor(email);
//
        Optional<Role> roleOpt = roleRepository.findById(roleId);
        Optional<Event> eventOpt = eventRepository.findById(eventId);
        Optional<AssignedRole> existingAssignment = assignedRoleRepository.getAssigned(userDTO.getUserId(), roleId, eventId);
        if (existingAssignment.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new Response(409, "Conflict", "Vai trò đã được gán"));
        }

        // Gán vai trò cho người dùng
        ResponseEntity<Response> roleAssignmentResponse = userService.AddMoreRoleForUser(email, roleOpt.get().getName());
        if (roleAssignmentResponse.getStatusCode() != HttpStatus.OK) {
            return roleAssignmentResponse;
        }

        // Lưu thông tin gán vai trò cho sự kiện
        AssignedRole assignedRole = new AssignedRole();
        assignedRole.setUser(userRepository.findById(userDTO.getUserId()).get());
        assignedRole.setRole(roleOpt.get());
        assignedRole.setEvent(eventOpt.get());
        assignedRoleRepository.save(assignedRole);

        return ResponseEntity.status(HttpStatus.CREATED).body(new Response(201, "Success", "Gán vai trò thành công"));
    }

    @Override
    public List<AssignedRoleDTO> getRoleAssignInEvent(int userId) {
        List<AssignedRole> assignments = assignedRoleRepository.findByUserUserId(userId);
        return assignments.stream().map(assignment -> new AssignedRoleDTO(
                assignment.getUser().getEmail(),
                assignment.getRole().getName(),
                assignment.getEvent().getEventID(),
                assignment.getEvent().getEventName()
        )).collect(Collectors.toList());
    }


    @Override
    public List<AssignedEventDTO> getAssignedEvents(int userId) {
        List<AssignedRole> assignments = assignedRoleRepository.findByUserUserId(userId);
        return assignments.stream().map(assignment -> {
            RoleDTO roleDTO = rolerService.getRoleById(assignment.getRole().getRoleId());
            return new AssignedEventDTO(assignment.getEvent().getEventID(),assignment.getEvent().getEventName(), assignment.getRole().getName(),
                    roleDTO.getPermissions().stream().map(permissionDTO -> permissionDTO.getName()).collect(Collectors.toList())
            );
        }).collect(Collectors.toList());
    }

    @Override
    public AssignedEventTeamDTO getTeam(int eventId){
        List<AssignedRole> list = assignedRoleRepository.findByEvent(eventId);
        AssignedEventTeamDTO team = new AssignedEventTeamDTO();
        team.setEventId(eventId);
        Set<Integer> teamIds = new HashSet<>();
        for (AssignedRole assignedRole : list) {
            teamIds.add(assignedRole.getUser().getUserId());
        }
        team.setTotalMembers(teamIds.size());
        List<TeamMemberDTO> members = new ArrayList<>();
        for (Integer teamId : teamIds) {
            UserDTO user = userService.findById(teamId);
            TeamMemberDTO member = new TeamMemberDTO();
            member.setUserId(user.getUserId());
            member.setFullName(user.getFullName());
            member.setEmail(user.getEmail());
            member.setRolesAssigned(assignedRoleRepository.getRoleNameAssigned(user.getUserId(),eventId));
            members.add(member);
        }
        team.setUsers(members);
        return team;
    }

    public void getEventsAssigned(int userId) {
        List<AssignedRole> list = assignedRoleRepository.findByUserUserId(userId);
        Set<Integer> eventsId = new HashSet<>();
        for (AssignedRole assignedRole : list) {
            eventsId.add(assignedRole.getEvent().getEventID());
        }

    }
    @Override
    public boolean deleteAssignedRole(int userId, int eventId, int roleId) {
        Optional<AssignedRole> assignedRole = assignedRoleRepository.getAssigned(userId,roleId,eventId);
        if(assignedRole.isPresent()) {
            assignedRoleRepository.delete(assignedRole.get());
            return true;
        }
        return false;
    }
}
