package hcmute.fit.event_management.mapper;

import com.cloudinary.Cloudinary;
import hcmute.fit.event_management.dto.EventDTO;
import hcmute.fit.event_management.dto.EventLocationDTO;
import hcmute.fit.event_management.entity.Event;
import hcmute.fit.event_management.repository.EventViewRepository;
import hcmute.fit.event_management.util.VietnamCities;
import lombok.AllArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@AllArgsConstructor
public class EventMapper {

    private final Cloudinary cloudinary;
    private final EventViewRepository eventViewRepository;


    public EventDTO toDto(Event event) {
        EventDTO dto = new EventDTO();
        BeanUtils.copyProperties(event, dto, "eventLocation", "eventType");
        dto.setEventId(event.getEventID());
        dto.setEventTypeId(event.getEventType().getId());
        dto.setEventType(event.getEventType().getTypeName());
        EventLocationDTO locationDTO = new EventLocationDTO();
        if (event.getEventLocation() != null) {
            BeanUtils.copyProperties(event.getEventLocation(), locationDTO);
            locationDTO.setCity(VietnamCities.getCityDisplayName(locationDTO.getCity()));
            dto.setEventLocation(locationDTO);
        }
        List<String> imageUrls = event.getEventImages().stream()
                .map(publicId -> cloudinary.url().generate(publicId))
                .collect(Collectors.toList());
        dto.setEventImages(imageUrls);
        List<String> mediaUrls = event.getMediaContent().stream()
                .map(publicId -> cloudinary.url().generate(publicId))
                .collect(Collectors.toList());
        if (event.getSeatingMapImage() != null) {
            dto.setSeatingMapImage(cloudinary.url().generate(event.getSeatingMapImage()));
        }
        if (event.getSeatingLayout() != null) {
            dto.setSeatingLayout(event.getSeatingLayout());
        }
        if (event.getSeatingMapImageVersions() != null) {
            List<String> versionUrls = event.getSeatingMapImageVersions().stream()
                    .map(publicId -> cloudinary.url().generate(publicId))
                    .collect(Collectors.toList());
            dto.setSeatingMapImageVersions(versionUrls);
        }
        dto.setMediaContent(mediaUrls);
        dto.setUserId(event.getUser().getUserId());
        long viewCount = eventViewRepository.countByEventEventID(event.getEventID());
        dto.setViewCount(viewCount);
        return dto;
    }
}
