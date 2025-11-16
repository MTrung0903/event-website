package hcmute.fit.event_management.service.Impl;

import com.cloudinary.Cloudinary;
import hcmute.fit.event_management.dto.OrganizerDTO;
import hcmute.fit.event_management.entity.Organizer;
import hcmute.fit.event_management.entity.Role;
import hcmute.fit.event_management.entity.User;
import hcmute.fit.event_management.entity.UserRole;
import hcmute.fit.event_management.entity.keys.AccountRoleId;
import hcmute.fit.event_management.repository.OrganizerRepository;
import hcmute.fit.event_management.repository.RoleRepository;
import hcmute.fit.event_management.repository.UserRepository;
import hcmute.fit.event_management.repository.UserRoleRepository;
import hcmute.fit.event_management.service.OrganizerService;
import org.springframework.beans.BeanUtils;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import payload.Response;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class OrganizerServiceImpl implements OrganizerService {

    private final OrganizerRepository organizerRepository;


    private final Cloudinary cloudinary;


    private final UserRepository userRepository;


    private final UserRoleRepository userRoleRepository;


    private final RoleRepository roleRepository;

    public OrganizerServiceImpl(Cloudinary cloudinary, OrganizerRepository organizerRepository,
                                UserRepository userRepository, UserRoleRepository userRoleRepository,
                                RoleRepository roleRepository) {
        this.cloudinary = cloudinary;
        this.organizerRepository = organizerRepository;
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public OrganizerDTO getOrganizerInforByEventHost(String eventHost) {
        OrganizerDTO organizerDTO = new OrganizerDTO();
        Optional<Organizer> organizer = organizerRepository.findByOrganizerName(eventHost);
        if(organizer.isPresent()) {
            BeanUtils.copyProperties(organizer.get(), organizerDTO);
            String urlImage = cloudinary.url().generate(organizer.get().getOrganizerLogo());
            organizerDTO.setOrganizerLogo(urlImage);
        }
        else {
            throw new RuntimeException("Organizer not found");
        }
        return organizerDTO;
    }
    @Override
    public Organizer findByUserUserId(int userId) {
        return organizerRepository.findByUserUserId(userId);
    }

    @Override
    public ResponseEntity<Response> upgradeToOrganizer(String email, OrganizerDTO organizerDTO) {

        User user = userRepository.findByEmail(email).orElse(null);

        // Thêm role ROLE_ORGANIZER trước
        Optional<Role> roleOpt = roleRepository.findByName("ROLE_ORGANIZER");


        Role organizerRole = roleOpt.orElse(null);
        assert user != null;
        assert organizerRole != null;
        AccountRoleId accountRoleId = new AccountRoleId(user.getUserId(), organizerRole.getRoleId());
        UserRole userRole = new UserRole(accountRoleId, user, organizerRole);
        userRoleRepository.save(userRole);

        Organizer organizer = new Organizer();
        BeanUtils.copyProperties(organizerDTO, organizer);
        organizer.setRegistrationDate(LocalDate.now());
        organizer.setUser(user);
        organizerRepository.save(organizer);
        user.setOrganizer(organizer);


        userRepository.save(user);


        return ResponseEntity.ok(new Response(200, "Success",
                "User upgraded to ROLE_ORGANIZER successfully"));
    }

}
