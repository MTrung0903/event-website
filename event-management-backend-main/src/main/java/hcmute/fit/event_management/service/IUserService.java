package hcmute.fit.event_management.service;

import hcmute.fit.event_management.dto.OrganizerDTO;
import hcmute.fit.event_management.dto.UserDTO;
import hcmute.fit.event_management.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import payload.Response;

import java.util.List;
import java.util.Optional;

public interface IUserService {


    @Transactional
    ResponseEntity<Response> register(UserDTO userDTO);

    ResponseEntity<Response> saveChangeInfor(UserDTO userChange);

    ResponseEntity<Response> AddMoreRoleForUser(String email, String roleName);

    ResponseEntity<Response> deleteRoleInUser(String email, String roleName);

    UserDTO getInfor(String email);

    UserDTO findById(int userId);


    @Transactional
    ResponseEntity<Response> upgradeToOrganizer(String email, OrganizerDTO organizerDTO);

    ResponseEntity<Response> deleteUser(String email);

    List<UserDTO> getAllUsers();

    List<UserDTO> searchUserForChat(String query, int currentUserId);

    Optional<User> findByEmail(String email);


    @Transactional
    ResponseEntity<Response> lockUser(String email);

    @Transactional
    ResponseEntity<Response> unlockUser(String email);
}