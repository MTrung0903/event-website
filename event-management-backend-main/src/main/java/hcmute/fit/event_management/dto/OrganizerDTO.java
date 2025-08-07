package hcmute.fit.event_management.dto;


import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public  class OrganizerDTO {
    private int organizerId;
    private String organizerName;
    private String organizerLogo;
    private String organizerAddress;
    private String organizerWebsite;
    private String organizerPhone;
    private String organizerDesc;
    private String organizerEmail;
}
