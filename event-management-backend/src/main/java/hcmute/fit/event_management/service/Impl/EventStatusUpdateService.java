package hcmute.fit.event_management.service.Impl;

import hcmute.fit.event_management.entity.Event;
import hcmute.fit.event_management.entity.Role;
import hcmute.fit.event_management.entity.User;
import hcmute.fit.event_management.entity.UserRole;
import hcmute.fit.event_management.entity.keys.AccountRoleId;
import hcmute.fit.event_management.repository.EventRepository;
import hcmute.fit.event_management.repository.RoleRepository;
import hcmute.fit.event_management.repository.UserRepository;
import hcmute.fit.event_management.repository.UserRoleRepository;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class EventStatusUpdateService {

    private final EventRepository eventRepository;

    private final UserRepository userRepository;

    private final RoleRepository roleRepository;

    private final PasswordEncoder passwordEncoder;

    private final UserRoleRepository userRoleRepository;

    private static final Logger logger = LoggerFactory.getLogger(EventStatusUpdateService.class);

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void updateEventStatusOnStartup() {
        logger.info("Bắt đầu cập nhật trạng thái sự kiện khi ứng dụng khởi động...");
        updateEventStatus();
        initDefaultAdmin();
        logger.info("Hoàn tất cập nhật trạng thái sự kiện.");
    }


    public void updateEventStatus() {
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfDay = today.plusDays(1).minusNanos(1);

        List<Event> events = eventRepository.findEventsForStatusUpdate(Arrays.asList("public"), endOfDay);
        List<Event> eventsToUpdate = new ArrayList<>();

        for (Event event : events) {
            if (event.getEventEnd() != null) {
                LocalDateTime eventEndDate = event.getEventEnd().withHour(0).withMinute(0).withSecond(0).withNano(0);
                if ("public".equals(event.getEventStatus()) &&
                        (eventEndDate.isBefore(today) || eventEndDate.isEqual(today))) {
                    event.setEventStatus("Complete");
                    eventsToUpdate.add(event);
                }
            }
        }

        if (!eventsToUpdate.isEmpty()) {
            eventRepository.saveAll(eventsToUpdate);
            logger.info("Đã cập nhật trạng thái {} sự kiện thành 'Complete'", eventsToUpdate.size());
        }
    }

    @Transactional
    public void initDefaultAdmin() {
        Optional<Role> adminRole = roleRepository.findByName("ROLE_ADMIN");
        if (adminRole.isEmpty()) {
            Role role = new Role();
            role.setName("ROLE_ADMIN");
            roleRepository.save(role);
            adminRole = Optional.of(role);

        }
        Optional<User> adminUser = userRepository.findByEmail("admin@gmail.com");
        if (adminUser.isEmpty()) {
            User user = new User();
            user.setEmail("admin@gmail.com");
            user.setPassword(passwordEncoder.encode("admin"));
            user.setGender("");
            user.setFullName("Admin");
            user.setActive(true);
            userRepository.save(user);

            AccountRoleId accountRoleId = new AccountRoleId(user.getUserId(), adminRole.get().getRoleId());
            UserRole userRole = new UserRole(accountRoleId, user, adminRole.get());
            userRoleRepository.save(userRole);
            logger.info("Created default admin account: admin@gmail.com");
        } else {
            logger.info("Admin account already exists: admin@gmail.com");
        }
    }
}
