package hcmute.fit.event_management.service;


import hcmute.fit.event_management.dto.EventDTO;
import hcmute.fit.event_management.dto.EventEditDTO;
import hcmute.fit.event_management.dto.EventViewDTO;
import hcmute.fit.event_management.entity.Event;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import payload.Response;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface EventService {



    List<EventDTO> sortEventsByStartTime(List<EventDTO> eventDTOs);

    Optional<Event> findById(Integer eventId);

    EventDTO getEventById(int eventId);



    List<EventDTO> getAllEvent();

    EventEditDTO getEventAfterEdit(int eventId);

    EventEditDTO saveEditEvent(EventEditDTO eventEditDTO) throws Exception;

    @Transactional
    ResponseEntity<Response> saveEventToDB(EventDTO eventDTO);

    Response deleteEventAndRefunds(HttpServletRequest request, int eventId) throws Exception;

    List<String> getAllTags();

    void recordEventView(Integer eventId, Integer userId);

    Response publishEvent(int eventId);

    Response reportEvent(int eventId, String reason);

    Response reopenEvent(int eventId);

    String getEventViewsAsCSV();
}
