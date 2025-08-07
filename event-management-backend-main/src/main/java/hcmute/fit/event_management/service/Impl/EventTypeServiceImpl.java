package hcmute.fit.event_management.service.Impl;

import hcmute.fit.event_management.dto.EventTypeDTO;
import hcmute.fit.event_management.entity.EventType;
import hcmute.fit.event_management.repository.EventTypeRepository;
import hcmute.fit.event_management.service.IEventTypeService;
import org.springframework.data.domain.Sort;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import payload.Response;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventTypeServiceImpl implements IEventTypeService {

    private final EventTypeRepository eventTypeRepository;

    public EventTypeServiceImpl(EventTypeRepository eventTypeRepository) {
        this.eventTypeRepository = eventTypeRepository;
    }


    @Override
    public List<EventTypeDTO> getAllEventTypes() {
        return eventTypeRepository.findAll(Sort.by("id").ascending()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }


    @Override
    public Response createEventType(EventTypeDTO eventTypeDTO) {
        if (eventTypeDTO.getTypeName() == null || eventTypeDTO.getTypeName().trim().isEmpty()) {
            throw new IllegalArgumentException("Type name cannot be empty");
        }

        if (eventTypeRepository.existsByTypeName(eventTypeDTO.getTypeName())) {
            return new Response(409, "The type of event already exists", false);
        }

        EventType eventType = new EventType();
        eventType.setTypeName(eventTypeDTO.getTypeName());
        EventType savedEventType = eventTypeRepository.save(eventType);
        return new Response(200, "Event type created successfully", convertToDTO(savedEventType));
    }


    @Override
    public Response updateEventType(Long id, EventTypeDTO eventTypeDTO) {
        if (eventTypeDTO.getTypeName() == null || eventTypeDTO.getTypeName().trim().isEmpty()) {
            throw new IllegalArgumentException("Type name cannot be empty");
        }

        EventType existingEventType = eventTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event type with ID " + id + " not found"));

        if (!existingEventType.getTypeName().equals(eventTypeDTO.getTypeName()) &&
                eventTypeRepository.existsByTypeName(eventTypeDTO.getTypeName())) {
            return new Response(409, "The type of event already exists", false);
        }

        existingEventType.setTypeName(eventTypeDTO.getTypeName());
        EventType updatedEventType = eventTypeRepository.save(existingEventType);
        return new Response(200, "Event type updated successfully", convertToDTO(updatedEventType));
    }


    @Override
    public void deleteEventType(Long id) {
        EventType eventType = eventTypeRepository.findById(id).orElse(null);

        eventTypeRepository.delete(eventType);
    }

    @Override
    public EventTypeDTO convertToDTO(EventType eventType) {
        EventTypeDTO dto = new EventTypeDTO();
        dto.setId(eventType.getId());
        dto.setTypeName(eventType.getTypeName());
        return dto;
    }
    @Override
    public List<EventTypeDTO> searchEventTypes(String typeName) {
        return eventTypeRepository.findByTypeNameContainingIgnoreCase(typeName).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}
