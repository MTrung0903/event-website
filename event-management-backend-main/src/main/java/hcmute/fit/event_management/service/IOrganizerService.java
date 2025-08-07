package hcmute.fit.event_management.service;

import hcmute.fit.event_management.dto.OrganizerDTO;
import hcmute.fit.event_management.entity.Organizer;

import java.util.List;

public interface IOrganizerService {
    OrganizerDTO getOrganizerInforByEventHost(String eventHost);

    Organizer findByUserUserId(int userId);
}
