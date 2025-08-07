package hcmute.fit.event_management.service.Impl;

import hcmute.fit.event_management.dto.UserDTO;
import hcmute.fit.event_management.dto.ResetPasswordDTO;
import hcmute.fit.event_management.entity.User;
import hcmute.fit.event_management.entity.PasswordResetToken;
import hcmute.fit.event_management.repository.UserRepository;
import hcmute.fit.event_management.repository.PasswordResetTokenRepository;
import hcmute.fit.event_management.service.AuthService;
import hcmute.fit.event_management.util.JwtTokenUtil;
import jakarta.mail.MessagingException;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import payload.Response;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    EmailServiceImpl emailService;
    @Autowired
    private JwtTokenUtil jwtTokenUtil;
    Logger logger = LoggerFactory.getLogger(this.getClass());
    @Override
    public ResponseEntity<Response> signIn(UserDTO account) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(account.getEmail());
            if (userOpt.isEmpty()) {
                logger.warn("Login failed: Email {} not found", account.getEmail());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new Response(401, "Unauthorized", "Email hoặc mật khẩu không hợp lệ"));
            }

            User user = userOpt.get();
            // Kiểm tra trạng thái is_active
            if (!user.isActive()) {
                logger.warn("Login failed: Account {} is locked", account.getEmail());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new Response(403, "Forbidden", "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên."));
            }

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(account.getEmail(), account.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            List<String> roles = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .filter(auth -> auth.startsWith("ROLE_"))
                    .map(auth -> auth.substring(5))
                    .collect(Collectors.toList());

            String token = jwtTokenUtil.generateToken(authentication, roles);

            logger.info("User {} logged in successfully", account.getEmail());
            return ResponseEntity.ok(new Response(200, "Success", token));
        } catch (AuthenticationException e) {
            logger.error("Login failed for email {}: {}", account.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new Response(401, "Unauthorized", "Email hoặc mật khẩu không hợp lệ"));
        }
    }
    @Transactional
    @Override
    public ResponseEntity<Response> sendResetPassword(String email) throws MessagingException {
        // Tìm tài khoản theo email
        Optional<User> accountOpt = userRepository.findByEmail(email);
        if (accountOpt.isEmpty()) {
            logger.warn("Account not found with password reset request for email: {}", email);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new Response(404, "Not Found", "Account with this email does not exist"));
        }

        User user = accountOpt.get();
        String newToken = jwtTokenUtil.generateResetToken(email);

        // Kiểm tra và cập nhật/đặt mới token
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByUserId(user.getUserId())
                .orElse(new PasswordResetToken());

        resetToken.setUser(user);
        resetToken.setToken(newToken);
        passwordResetTokenRepository.save(resetToken);

        // Gửi email
        emailService.sendResetEmail(email, newToken);
        logger.info("Password reset request email sent successfully for email: {}", email);

        return ResponseEntity.ok(new Response(200, "Success", "Password reset link has been sent to your email"));
    }

    @Transactional
    @Override
    public ResponseEntity<Response> resetPassword(ResetPasswordDTO resetPasswordDTO) {
        String token = resetPasswordDTO.getToken();
        Response response;
        if (jwtTokenUtil.validateToken(token)) {
            Optional<PasswordResetToken> passwordResetToken = passwordResetTokenRepository.findByToken(token);
            if (passwordResetToken.isPresent()) {
                User user = passwordResetToken.get().getUser();
                // Set the new password for the account
                user.setPassword(passwordEncoder.encode(resetPasswordDTO.getNewPassword()));
                passwordResetTokenRepository.delete(passwordResetToken.get());
                // Remove the relationship to the deleted token to avoid cascade persistence
                user.setToken(null);
                userRepository.save(user);
                response = new Response(200, "Password successfully reset", "True");
                logger.info("The account's password has been reset successfully");
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                response = new Response(404, "Token not found", "False");
                logger.warn("Password reset token not foundt");
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
        } else {
            response = new Response(400, "Invalid token", "False");
            logger.warn("Invalid reset token");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public ResponseEntity<Response> logout() {
        SecurityContextHolder.clearContext();
        logger.info("User logged out successfully");
        return ResponseEntity.ok(new Response(200, "Success", "Logged out successfully"));
    }
}
