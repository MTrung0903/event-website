package hcmute.fit.event_management.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SponsorEventDTO {
    private int sponsorId;
    private String sponsorName;
    private String sponsorLogo;
    private String sponsorEmail;
    private String sponsorPhone;
    private String sponsorAddress;
    private String sponsorWebsite;
    private String sponsorRepresentativeName;
    private String sponsorRepresentativeEmail;
    private String sponsorRepresentativePhone;
    private String sponsorRepresentativePosition;
    private String sponsorType;
    private String sponsorLevel;
    private String sponsorStartDate;
    private String sponsorEndDate;
    private String sponsorStatus;
}
