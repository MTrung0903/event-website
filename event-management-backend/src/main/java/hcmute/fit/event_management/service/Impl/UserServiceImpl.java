package hcmute.fit.event_management.service.Impl;

import com.cloudinary.Cloudinary;
import hcmute.fit.event_management.dto.OrganizerDTO;
import hcmute.fit.event_management.dto.PermissionDTO;
import hcmute.fit.event_management.dto.RoleDTO;
import hcmute.fit.event_management.dto.UserDTO;
import hcmute.fit.event_management.entity.*;
import hcmute.fit.event_management.entity.keys.AccountRoleId;
import hcmute.fit.event_management.mapper.UserMapper;
import hcmute.fit.event_management.repository.*;
import hcmute.fit.event_management.service.UserService;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import payload.Response;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service

public class UserServiceImpl implements UserService {


    private final UserRepository userRepository;


    private final RoleRepository roleRepository;


    private final UserRoleRepository userRoleRepository;


    private final PasswordEncoder passwordEncoder;


    private final OrganizerRepository organizerRepository;




    private final MessageRepository messageRepository;

    private final UserMapper userMapper;

    public UserServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository, UserRoleRepository userRoleRepository,
                           PasswordEncoder passwordEncoder, OrganizerRepository organizerRepository,
                           MessageRepository messageRepository, UserMapper userMapper) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
        this.organizerRepository = organizerRepository;
        this.messageRepository = messageRepository;
        this.userMapper = userMapper;
    }

    Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);






    @Transactional
    @Override
    public ResponseEntity<Response> register(UserDTO userDTO) {
        // Kiểm tra email đã tồn tại
        if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {

            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new Response(409, "Conflict", "Email already exists"));
        }
        // Xác định vai trò dựa trên organizer
        String roleName = userDTO.getOrganizer() == null ? "ROLE_ATTENDEE" : "ROLE_ORGANIZER";
        Optional<Role> role = roleRepository.findByName(roleName);
        if (role.isEmpty()) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new Response(500, "Error", roleName + " not configured"));
        }
        // Tạo user
        User user = new User();
        BeanUtils.copyProperties(userDTO, user);

        user.setActive(true);

        if (userDTO.getPreferredEventTypes() != null) {
            user.setPreferredEventTypes(new ArrayList<>(userDTO.getPreferredEventTypes()));
        }
        if (userDTO.getPreferredTags() != null) {
            user.setPreferredTags(new ArrayList<>(userDTO.getPreferredTags()));
        }
        // Lưu user
        User savedUser = userRepository.save(user);

        // Gán vai trò
        AccountRoleId accountRoleId = new AccountRoleId(savedUser.getUserId(), role.get().getRoleId());
        UserRole userRole = new UserRole();
        userRole.setId(accountRoleId);
        userRole.setUser(savedUser);
        userRole.setRole(role.get());
        userRoleRepository.save(userRole);

        // Nếu là ROLE_ORGANIZER, lưu thông tin Organizer
        if (userDTO.getOrganizer() != null) {
            Organizer organizer = new Organizer();
            organizer.setOrganizerName(userDTO.getOrganizer().getOrganizerName());
            organizer.setOrganizerAddress(userDTO.getOrganizer().getOrganizerAddress());
            organizer.setOrganizerWebsite(userDTO.getOrganizer().getOrganizerWebsite());
            organizer.setOrganizerPhone(userDTO.getOrganizer().getOrganizerPhone());
            organizer.setUser(savedUser);
            organizerRepository.save(organizer);
        }

        logger.info("User registered successfully with email: {}", userDTO.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new Response(201, "Success", "User registered successfully"));
    }


    @Override
    public ResponseEntity<Response> saveChangeInfor(UserDTO userChange) {
        if ( userChange.getEmail().isEmpty()) {

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).
                    body(new Response(400, "Bad Request", "Email is required"));
        }

        User user = userRepository.findByEmail(userChange.getEmail()).orElseThrow(() ->
                new BadCredentialsException("User not found"));


        // Kiểm tra email mới (nếu thay đổi)
        if (!userChange.getEmail().equals(user.getEmail())) {
            Optional<User> existingUserWithNewEmail = userRepository.findByEmail(userChange.getEmail());
            if (existingUserWithNewEmail.isPresent()) {
                logger.error("Email {} already exists", userChange.getEmail());
                return ResponseEntity.status(HttpStatus.CONFLICT).
                        body(new Response(409, "Conflict", "Email already exists"));
            }
            user.setEmail(userChange.getEmail());
        }

        user.setFullName(userChange.getFullName());
        user.setGender(userChange.getGender());
        user.setBirthday(userChange.getBirthday());
        user.setAddress(userChange.getAddress());

        if (userChange.getOrganizer() != null) {
            OrganizerDTO organizerDTO = userChange.getOrganizer();
            if (organizerDTO.getOrganizerName() == null || organizerDTO.getOrganizerName().isEmpty()) {
                logger.error("Invalid organizer name provided");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).
                        body(new Response(400, "Bad Request", "Organizer name is required"));
            }

            Organizer organizer = user.getOrganizer();
            if (organizer == null) {
                // Nếu user chưa có Organizer, tạo mới
                organizer = new Organizer();
                organizer.setUser(user);
                user.setOrganizer(organizer);
            }
            // Sao chép thuộc tính nhưng bỏ qua organizerId
            BeanUtils.copyProperties(organizerDTO, organizer, "organizerId");
            organizerRepository.save(organizer);
        }

        // Lưu user
        userRepository.save(user);


        return ResponseEntity.ok(new Response(200, "Success",
                "User information updated successfully"));
    }

    @Override
    public ResponseEntity<Response> AddMoreRoleForUser(String email, String roleName) {
        User user = userRepository.findByEmail(email).orElseThrow(() ->
                new BadCredentialsException("User not found"));

        Role role = roleRepository.findByName(roleName).orElseThrow(() ->
                new BadCredentialsException("Role not found"));

        // Thêm role mới
        AccountRoleId accountRoleId = new AccountRoleId(user.getUserId(), role.getRoleId());
        UserRole userRole = new UserRole(accountRoleId, user, role);
        userRoleRepository.save(userRole);

        return ResponseEntity.ok(new Response(200, "Success",
                "Role added successfully"));
    }

    @Transactional
    @Override
    public ResponseEntity<Response> deleteRoleInUser(String email, String roleName) {
        User user = userRepository.findByEmail(email).orElseThrow(() ->
                new BadCredentialsException("user not found"));


        Role role = roleRepository.findByName(roleName).orElseThrow(() ->
                new BadCredentialsException("role not found"));


        // Kiểm tra số lượng vai trò của người dùng
        List<UserRole>userRoles = userRoleRepository.findAllByUser(user).orElseThrow(() ->
                new BadCredentialsException("role not found"));
        if (userRoles.size() == 1 && userRoles.get(0).getRole().getRoleId() == role.getRoleId()) {

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new Response(400, "Bad Request",
                            "Cannot remove the only role of the user"));


        }
        // Tìm và xóa UserRole
        for (UserRole ur : userRoles) {
            if (ur.getRole().getRoleId() == role.getRoleId()) {
                userRoleRepository.delete(ur);
                // Nếu vai trò là ROLE_ORGANIZER, xóa thông tin Organizer
                if ("ROLE_ORGANIZER".equals(roleName) && user.getOrganizer() != null) {
                    try {
                        organizerRepository.deleteById(user.getOrganizer().getOrganizerId());

                        user.setOrganizer(null);
                        userRepository.save(user);
                    } catch (Exception e) {

                        throw new RuntimeException("Failed to delete Organizer", e);
                    }
                }

                return ResponseEntity.ok(new Response(200, "Success", "Role removed successfully"));
            }
        }

        logger.warn("Role {} not found for user {}", roleName, email);
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new Response(404, "Not Found", "Role not assigned to user"));
    }

    @Override
    public UserDTO getInfor(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            logger.error("User with email {} not found", email);
            return new UserDTO();
        }

        User user = userOpt.get();
        Optional<List<UserRole>> userRolesOpt = userRoleRepository.findAllByUser(user);
        return userMapper.toDto(user, userRolesOpt);
    }

    @Override
    public UserDTO findById(int userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return new UserDTO();
        }

        User user = userOpt.get();
        Optional<List<UserRole>> userRolesOpt = userRoleRepository.findAllByUser(user);
        return userMapper.toDto(user, userRolesOpt);
    }

    @Transactional
    @Override
    public ResponseEntity<Response> upgradeToOrganizer(String email, OrganizerDTO organizerDTO) {
        // Kiểm tra email hợp lệ
        if (email == null || email.isEmpty()) {
            logger.error("Invalid email provided");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new Response(400, "Bad Request", "Email is required"));
        }

        // Tìm user theo email
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            logger.error("User with email {} not found", email);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new Response(404, "Not Found", "User not found"));
        }

        User user = userOpt.get();

        // Kiểm tra xem user có role ROLE_ORGANIZER không
        Optional<List<UserRole>> userRolesOpt = userRoleRepository.findAllByUser(user);
        boolean hasOrganizerRole = false;
        if (userRolesOpt.isPresent()) {
            for (UserRole ur : userRolesOpt.get()) {
                if (ur.getRole().getName().equals("ROLE_ORGANIZER")) {
                    hasOrganizerRole = true;
                    break;
                }
            }
        }
        if (hasOrganizerRole) {
            logger.warn("User with email {} already has ROLE_ORGANIZER", email);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new Response(409, "Conflict", "User already has ROLE_ORGANIZER"));
        }

        // Kiểm tra OrganizerDTO hợp lệ
        if (organizerDTO == null || organizerDTO.getOrganizerName() == null || organizerDTO.getOrganizerName().isEmpty()) {
            logger.error("Invalid organizer data provided");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new Response(400, "Bad Request", "Organizer name is required"));
        }

        // Thêm role ROLE_ORGANIZER trước
        Optional<Role> roleOpt = roleRepository.findByName("ROLE_ORGANIZER");
        if (!roleOpt.isPresent()) {
            logger.error("ROLE_ORGANIZER not found in database");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new Response(500, "Error", "ROLE_ORGANIZER not configured"));
        }

        Role organizerRole = roleOpt.get();
        AccountRoleId accountRoleId = new AccountRoleId(user.getUserId(), organizerRole.getRoleId());
        UserRole userRole = new UserRole(accountRoleId, user, organizerRole);
        userRoleRepository.save(userRole);
        logger.info("Added ROLE_ORGANIZER for user {}", email);

        // Xóa vai trò ROLE_ATTENDEE sau khi đã thêm ROLE_ORGANIZER
        ResponseEntity<Response> deleteResponse = deleteRoleInUser(email, "ROLE_ATTENDEE");
        if (deleteResponse.getStatusCode() != HttpStatus.OK) {
            logger.error("Failed to delete ROLE_ATTENDEE for user {}", email);
            // Rollback giao dịch nếu cần

            return deleteResponse; // Trả về lỗi nếu không xóa được vai trò
        }

        // Tạo mới Organizer
        if (user.getOrganizer() != null) {
            logger.warn("User with email {} already has an Organizer", email);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new Response(409, "Conflict", "User already has an Organizer"));
        }
        Organizer organizer = new Organizer();
        organizer.setOrganizerName(organizerDTO.getOrganizerName());
        organizer.setOrganizerLogo(organizerDTO.getOrganizerLogo());
        organizer.setOrganizerAddress(organizerDTO.getOrganizerAddress());
        organizer.setOrganizerWebsite(organizerDTO.getOrganizerWebsite());
        organizer.setOrganizerPhone(organizerDTO.getOrganizerPhone());
        organizer.setOrganizerDesc(organizerDTO.getOrganizerDesc());
        organizer.setRegistrationDate(LocalDate.now());
        organizer.setUser(user);
        organizerRepository.save(organizer);
        user.setOrganizer(organizer);

        // Lưu user
        userRepository.save(user);

        logger.info("User with email {} upgraded to ROLE_ORGANIZER successfully", email);
        return ResponseEntity.ok(new Response(200, "Success", "User upgraded to ROLE_ORGANIZER successfully"));
    }

    @Override
    public ResponseEntity<Response> deleteUser(String email) {
        if (email.isEmpty()) {
            logger.error("Invalid email provided");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new Response(400, "Bad Request", "Email is required"));
        }

        User userOpt = userRepository.findByEmail(email).orElseThrow(() ->
                new BadCredentialsException("User not found"));




        // Kiểm tra nếu user là admin mặc định
        if (userOpt.getEmail().equals("admin@gmail.com")) {
            logger.warn("Cannot delete default admin account: {}", email);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new Response(400, "Bad Request",
                            "Cannot delete default admin account"));
        }

        // Xóa các liên kết
        Optional<List<UserRole>> userRolesOpt = userRoleRepository.findAllByUser(userOpt);
        if (userRolesOpt.isPresent()) {
            userRoleRepository.deleteAll(userRolesOpt.get());
        }

        if (userOpt.getOrganizer() != null) {
            organizerRepository.delete(userOpt.getOrganizer());
        }

        // Xóa user
        userRepository.delete(userOpt);

        logger.info("User with email {} deleted successfully", email);
        return ResponseEntity.ok(new Response(200, "Success", "User deleted successfully"));
    }

    @Override
    public List<UserDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDTO> userDTOs = new ArrayList<>();

        for (User user : users) {
            Optional<List<UserRole>> userRolesOpt = userRoleRepository.findAllByUser(user);
            UserDTO userDTO = userMapper.toDto(user, userRolesOpt);
            userDTOs.add(userDTO);
        }

        logger.info("Retrieved {} users", userDTOs.size());
        return userDTOs;
    }

    @Override
    public List<UserDTO> searchUserForChat(String query, int currentUserId) {
        if (query == null || query.trim().isEmpty()) {
            logger.warn("Search query is empty for user ID: {}", currentUserId);
            return Collections.emptyList();
        }

        List<User> users = userRepository.findActiveUsersByFullNameOrEmail(query.trim());
        List<UserDTO> userDTOs = users.stream()
                .filter(user -> user.getUserId() != currentUserId)
                .map(user -> {
                    UserDTO userDTO = new UserDTO();
                    userDTO.setUserId(user.getUserId());
                    userDTO.setEmail(user.getEmail() != null ? user.getEmail() : "");
                    userDTO.setFullName(user.getFullName() != null ? user.getFullName() : "");
                    userDTO.setActive(user.isActive());
                    long unreadCount = messageRepository.countUnreadMessages(currentUserId, user.getUserId());
                    userDTO.setUnreadCount((int) unreadCount);
                    return userDTO;
                })
                .collect(Collectors.toList());

        logger.info("Found {} users for query '{}' and user ID {}", userDTOs.size(), query, currentUserId);
        return userDTOs;
    }
    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Transactional
    @Override
    public ResponseEntity<Response> lockUser(String email) {
        if (email == null || email.isEmpty()) {

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new Response(400, "Bad Request", "Email là bắt buộc"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new Response(404, "Not Found", "Không tìm thấy người dùng"));
        }

        User user = userOpt.get();

        // Kiểm tra nếu user là admin mặc định
        if (user.getEmail().equals("admin@gmail.com")) {

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new Response(400, "Bad Request",
                            "Không thể khóa tài khoản admin mặc định"));
        }

        if (!user.isActive()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new Response(409, "Conflict", "Tài khoản đã bị khóa"));
        }

        user.setActive(false);
        userRepository.save(user);


        return ResponseEntity.ok(new Response(200, "Success",
                "Tài khoản đã được khóa thành công"));
    }


    @Transactional
    @Override
    public ResponseEntity<Response> unlockUser(String email) {
        if (email == null || email.isEmpty()) {

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new Response(400, "Bad Request", "Email là bắt buộc"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new Response(404, "Not Found", "Không tìm thấy người dùng"));
        }

        User user = userOpt.get();
        if (user.isActive()) {

            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new Response(409, "Conflict", "Tài khoản đã được mở khóa"));
        }

        user.setActive(true);
        userRepository.save(user);


        return ResponseEntity.ok(new Response(200, "Success",
                "Tài khoản đã được mở khóa thành công"));
    }

}