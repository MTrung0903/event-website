package hcmute.fit.event_management.service;

import hcmute.fit.event_management.dto.UserDTO;
import hcmute.fit.event_management.dto.ResetPasswordDTO;
import jakarta.mail.MessagingException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import payload.Response;

@Service
public interface AuthService {
    ResponseEntity<Response> signIn(UserDTO account);
    ResponseEntity<Response> resetPassword(ResetPasswordDTO resetPasswordDTO);
    ResponseEntity<Response> sendResetPassword(String email) throws MessagingException;

    ResponseEntity<Response> logout();
}
