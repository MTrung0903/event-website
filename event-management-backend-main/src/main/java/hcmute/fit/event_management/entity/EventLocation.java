package hcmute.fit.event_management.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@AllArgsConstructor
@NoArgsConstructor
public class EventLocation {
    private String locationType;
    private String venueName;
    private String venueSlug;
    private String address;
    private String city;
}