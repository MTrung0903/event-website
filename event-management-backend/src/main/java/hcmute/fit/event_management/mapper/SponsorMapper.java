package hcmute.fit.event_management.mapper;

import hcmute.fit.event_management.dto.SponsorDTO;
import hcmute.fit.event_management.dto.SponsorEventDTO;
import hcmute.fit.event_management.entity.Sponsor;
import hcmute.fit.event_management.entity.SponsorEvent;
import hcmute.fit.event_management.service.CloudinaryService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

@Component
public class SponsorMapper {

    private final CloudinaryService cloudinaryService;
    public SponsorMapper(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }
    public SponsorEventDTO toSponsorEventDto(SponsorEvent sponsorEvent) {
        SponsorEventDTO sponsorEventDTO = new SponsorEventDTO();
        sponsorEventDTO.setSponsorId(sponsorEvent.getSponsor().getSponsorId());
        sponsorEventDTO.setSponsorName(sponsorEvent.getSponsor().getSponsorName());
        sponsorEventDTO.setSponsorEmail(sponsorEvent.getSponsor().getSponsorEmail());
        sponsorEventDTO.setSponsorAddress(sponsorEvent.getSponsor().getSponsorAddress());
        sponsorEventDTO.setSponsorLogo(cloudinaryService.getFileUrl(sponsorEvent.getSponsor().getSponsorLogo()));
        sponsorEventDTO.setSponsorPhone(sponsorEvent.getSponsor().getSponsorPhone());
        sponsorEventDTO.setSponsorWebsite(sponsorEvent.getSponsor().getSponsorWebsite());
        sponsorEventDTO.setSponsorRepresentativeName(sponsorEvent.getSponsor().getSponsorRepresentativeName());
        sponsorEventDTO.setSponsorRepresentativeEmail(sponsorEvent.getSponsor().getSponsorRepresentativeEmail());
        sponsorEventDTO.setSponsorRepresentativePhone(sponsorEvent.getSponsor().getSponsorRepresentativePhone());
        sponsorEventDTO.setSponsorRepresentativePosition(sponsorEvent.getSponsor().getSponsorRepresentativePosition());
        sponsorEventDTO.setSponsorType(sponsorEvent.getSponsorType());
        sponsorEventDTO.setSponsorLevel(sponsorEvent.getSponsorLevel());
        sponsorEventDTO.setSponsorStartDate(sponsorEvent.getSponsorStartDate());
        sponsorEventDTO.setSponsorEndDate(sponsorEvent.getSponsorEndDate());
        sponsorEventDTO.setSponsorStatus(sponsorEvent.getSponsorStatus());
        return sponsorEventDTO;
    }
    public SponsorDTO toSponsorDto(Sponsor sponsor) {
        SponsorDTO sponsorDTO = new SponsorDTO();
        BeanUtils.copyProperties(sponsor, sponsorDTO);
        sponsorDTO.setSponsorLogo(cloudinaryService.getFileUrl(sponsor.getSponsorLogo()));
        return sponsorDTO;
    }
}
