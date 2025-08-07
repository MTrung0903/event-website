package hcmute.fit.event_management.service;

import hcmute.fit.event_management.dto.EventTypeDTO;
import hcmute.fit.event_management.entity.EventType;
import payload.Response;

import java.util.List;

public interface IEventTypeService {
    List<EventTypeDTO> getAllEventTypes();

    Response createEventType(EventTypeDTO eventTypeDTO);

    Response updateEventType(Long id, EventTypeDTO eventTypeDTO);

    void deleteEventType(Long id);

    EventTypeDTO convertToDTO(EventType eventType);

    List<EventTypeDTO> searchEventTypes(String typeName);
}
