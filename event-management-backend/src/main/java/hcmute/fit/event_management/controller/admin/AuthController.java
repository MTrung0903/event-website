package hcmute.fit.event_management.controller.admin;

import hcmute.fit.event_management.dto.*;
import hcmute.fit.event_management.entity.Organizer;
import hcmute.fit.event_management.entity.User;
import hcmute.fit.event_management.service.IFollowService;
import hcmute.fit.event_management.service.IUserService;
import hcmute.fit.event_management.service.Impl.AuthServiceImpl;
import hcmute.fit.event_management.service.Impl.EmailServiceImpl;
import jakarta.mail.MessagingException;
import jakarta.validation.constraints.Email;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import payload.Response;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthServiceImpl authService;

    @Autowired
    private IUserService userService;

    @Autowired
    private EmailServiceImpl emailService;

    @Autowired
    private IFollowService followService;

    @PostMapping("/login")
    public ResponseEntity<Response> login(@RequestBody UserDTO userDTO) {
        return authService.signIn(userDTO);
    }

    @PostMapping("/register")
    public ResponseEntity<Response> register(@RequestBody UserDTO userDTO) {
        return userService.register(userDTO);
    }

    @PostMapping("/forgot")
    public ResponseEntity<Response> forgotPassword(@RequestBody ForgotPasswordDTO forgotPasswordDTO) throws MessagingException {
        return authService.sendResetPassword(forgotPasswordDTO.getEmail());
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Response> resetPassword(@RequestBody ResetPasswordDTO resetPasswordDTO) {
        return authService.resetPassword(resetPasswordDTO);
    }

    @PostMapping("/logout")
    public ResponseEntity<Response> logout() {
        return authService.logout();
    }

    @PostMapping("/send-verification-code/{email}")
    public ResponseEntity<String> sendVerificationCode(@PathVariable String email) {
        try {
            String code = emailService.sendVerificationCode(email);
            return ResponseEntity.ok(code);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/save-change")
    public ResponseEntity<Response> saveChange(@RequestBody UserDTO userDTO) {
        return userService.saveChangeInfor(userDTO);
    }
    @PostMapping("{email}/add-new-role/{roleName}")
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    public ResponseEntity<Response> addNewRole(@PathVariable String email, @PathVariable String roleName) {
        return userService.AddMoreRoleForUser(email, roleName);
    }
    @DeleteMapping("{email}/remove-role/{roleName}")
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    public ResponseEntity<Response> removeRole(@PathVariable String email, @PathVariable String roleName) {
        return userService.deleteRoleInUser(email, roleName);
    }
    @GetMapping("/user/{email}")
    public ResponseEntity<UserDTO> getUserInfo(@PathVariable @Email String email) {
        UserDTO userDTO = userService.getInfor(email);
        return ResponseEntity.ok(userDTO);
    }
    @PostMapping("/user/upgrade-organizer/{email}")
    @PreAuthorize("hasAnyRole('ATTENDEE','ADMIN')")
    public ResponseEntity<Response> upgradeToOrganizer(@PathVariable @Email String email, @RequestBody OrganizerDTO organizerDTO) {
        return userService.upgradeToOrganizer(email, organizerDTO);
    }
    @DeleteMapping("/users/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Response> deleteUser(@PathVariable @Email String email) {
        return userService.deleteUser(email);
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Response> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(new Response(200, "Success", users));
    }
    @PostMapping("/users/{email}/lock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Response> lockUser(@PathVariable @Email String email) {
        return userService.lockUser(email);
    }

    @PostMapping("/users/{email}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Response> unlockUser(@PathVariable @Email String email) {
        return userService.unlockUser(email);
    }

}
