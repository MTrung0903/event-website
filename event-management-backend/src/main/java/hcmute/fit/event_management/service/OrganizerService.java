package hcmute.fit.event_management.service;

import hcmute.fit.event_management.dto.OrganizerDTO;
import hcmute.fit.event_management.entity.Organizer;
import org.springframework.http.ResponseEntity;
import payload.Response;

public interface OrganizerService {
    OrganizerDTO getOrganizerInforByEventHost(String eventHost);

    Organizer findByUserUserId(int userId);

    ResponseEntity<Response> upgradeToOrganizer(String email, OrganizerDTO organizerDTO);
}
