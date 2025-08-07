package hcmute.fit.event_management.dto;

import hcmute.fit.event_management.entity.SponsorEvent;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SponsorDTO {
    private int sponsorId;
    private String sponsorLogo;
    private String sponsorName;
    private String sponsorEmail;
    private String sponsorPhone;
    private String sponsorWebsite;
    private String sponsorAddress;
    private String sponsorRepresentativeName;
    private String sponsorRepresentativePosition;
    private String sponsorRepresentativeEmail;
    private String sponsorRepresentativePhone;
    private List<SponsorEventDTO> listSponsorEvents;
}
