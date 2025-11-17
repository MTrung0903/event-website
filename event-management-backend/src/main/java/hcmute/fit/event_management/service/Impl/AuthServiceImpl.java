package hcmute.fit.event_management.service.Impl;

import hcmute.fit.event_management.dto.UserDTO;
import hcmute.fit.event_management.dto.ResetPasswordDTO;
import hcmute.fit.event_management.entity.User;
import hcmute.fit.event_management.entity.PasswordResetToken;
import hcmute.fit.event_management.repository.UserRepository;
import hcmute.fit.event_management.repository.PasswordResetTokenRepository;
import hcmute.fit.event_management.service.AuthService;
import hcmute.fit.event_management.util.JwtTokenUtil;

import jakarta.transaction.Transactional;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;
import payload.Response;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {


    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

    private final PasswordResetTokenRepository passwordResetTokenRepository;

    private  final UserRepository userRepository;

    private final EmailServiceImpl emailService;

    private final JwtTokenUtil jwtTokenUtil;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           EmailServiceImpl emailService, JwtTokenUtil jwtTokenUtil,
                           PasswordEncoder passwordEncoder,
                           PasswordResetTokenRepository passwordResetTokenRepository,
                           UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
        this.jwtTokenUtil = jwtTokenUtil;
        this.passwordEncoder = passwordEncoder;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.userRepository = userRepository;
    }

    @Override
    public ResponseEntity<Response> signIn(UserDTO account) {
        try {
            User user = userRepository.findByEmail(account.getEmail()).orElseThrow(() ->
                    new BadCredentialsException("Email hoặc mật khẩu không chính xác"));

            if(!passwordEncoder.matches(account.getPassword(), user.getPassword())) {
                throw new BadCredentialsException("Wrong password");
            }



            // Kiểm tra trạng thái is_active
            if (!user.isActive()) {

                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new Response(403, "Forbidden",
                                "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên."));
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


            return ResponseEntity.ok(new Response(200, "Success", token));

        } catch (AuthenticationException e) {


            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new Response(401, "Unauthorized",
                            "Email hoặc mật khẩu không hợp lệ"));
        }
    }
    @Transactional
    @Override
    public ResponseEntity<Response> sendResetPassword(String email)  {
        // Tìm tài khoản theo email
        Optional<User> accountOpt = userRepository.findByEmail(email);
        if (accountOpt.isEmpty()) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new Response(404, "Not Found",
                            "Account with this email does not exist"));
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


        return ResponseEntity.ok(new Response(200, "Success",
                "Password reset link has been sent to your email"));
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

                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                response = new Response(404, "Token not found", "False");

                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
        } else {
            response = new Response(400, "Invalid token", "False");

            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public ResponseEntity<Response> logout() {
        SecurityContextHolder.clearContext();

        return ResponseEntity.ok(new Response(200, "Success", "Logged out successfully"));
    }
}
