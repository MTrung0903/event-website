package hcmute.fit.event_management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "sponsor")
public class Sponsor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sponsor_id")
    private int sponsorId;
    @Column(name = "sponsor_name")
    private String sponsorName;
    @Column(name = "sponsor_logo")
    private String sponsorLogo;
    @Column(name = "contact_email")
    private String sponsorEmail;
    @Column(name = "address")
    private String sponsorAddress;
    @Column(name = "phone")
    private String sponsorPhone;
    @Column(name = "website")
    private String sponsorWebsite;
    @Column(name = "representative_name")
    private String sponsorRepresentativeName;
    @Column(name = "representative_position")
    private String sponsorRepresentativePosition;
    @Column(name = "representative_email")
    private String sponsorRepresentativeEmail;
    @Column(name = "representative_phone")
    private String sponsorRepresentativePhone;
    @OneToMany(mappedBy = "sponsor")
    private List<SponsorEvent> listSponsorEvents;
}
