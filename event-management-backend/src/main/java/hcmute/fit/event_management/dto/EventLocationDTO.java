package hcmute.fit.event_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EventLocationDTO {
    private String locationType;
    private String venueName;
    private String venueSlug;
    private String address;
    private String city;
}
