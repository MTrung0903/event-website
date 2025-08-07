package hcmute.fit.event_management.service.Impl;

import com.cloudinary.Cloudinary;
import hcmute.fit.event_management.dto.OrganizerDTO;
import hcmute.fit.event_management.entity.Organizer;
import hcmute.fit.event_management.repository.OrganizerRepository;
import hcmute.fit.event_management.service.IOrganizerService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrganizerServiceImpl implements IOrganizerService {
    @Autowired
    private OrganizerRepository organizerRepository;

    @Autowired
    private Cloudinary cloudinary;


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

    public void updateOrganizer(OrganizerDTO organizerDTO) {
        Optional<Organizer> organizer = organizerRepository.findByOrganizerName(organizerDTO.getOrganizerName());
        if(!organizer.isPresent()) {
            throw new RuntimeException("Organizer not found");
        }
        Organizer organizerEntity = organizer.get();
        BeanUtils.copyProperties(organizerDTO, organizerEntity);
        organizerRepository.save(organizerEntity);
    }

}
