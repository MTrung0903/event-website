package hcmute.fit.event_management.mapper;

import hcmute.fit.event_management.dto.EventDetailDTO;
import hcmute.fit.event_management.dto.OrganizerDTO;
import hcmute.fit.event_management.dto.UserDTO;
import hcmute.fit.event_management.service.*;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class EventDetailMapper {

    private final EventService eventService;
    private final OrganizerService organizerService;
    private final UserService userService;
    private final TicketService ticketService;
    private final SegmentService segmentService;
    private final SponsorService sponsorService;

    public EventDetailDTO toDto(int eventId) {
        EventDetailDTO detailDTO = new EventDetailDTO();
        detailDTO.setEvent(eventService.getEventById(eventId));
        detailDTO.setTickets(ticketService.getTicketsByEventId(eventId));
        detailDTO.setSegments(segmentService.getAllSegments(eventId));
        if(sponsorService.getAllSponsorsInEvent(eventId) != null){
            detailDTO.setSponsors(sponsorService.getAllSponsorsInEvent(eventId));
        }
        UserDTO organizer = userService.findById(detailDTO.getEvent().getUserId());
        if(detailDTO.getEvent() != null && detailDTO.getEvent().getEventHost() != null) {
            String eventHost = detailDTO.getEvent().getEventHost();
            OrganizerDTO infor = organizerService.getOrganizerInforByEventHost(eventHost);
            infor.setOrganizerEmail(organizer.getEmail());
            detailDTO.setOrganizer(infor);
        }
        return detailDTO;
    }

}
