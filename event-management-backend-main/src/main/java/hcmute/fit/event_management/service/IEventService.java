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

public interface IEventService {
    List<EventDTO> sortEventsByStartTime(List<EventDTO> eventDTOs);

    Event saveEvent(EventDTO eventDTO) throws IOException;
    Optional<Event> findById(Integer eventId);
    EventDTO getEventById(int eventId);
    EventDTO convertToDTO(Event event);
    List<EventDTO> getAllEvent();

    EventEditDTO getEventAfterEdit(int eventId);
    EventEditDTO saveEditEvent(EventEditDTO eventEditDTO) throws Exception;
    void deleteEvent(int eventId);
    List<EventDTO> findEventsByName(String eventName);

    List<EventDTO> findEventsStatus(String eventStatus);

    List<EventDTO> findEventsByDate(LocalDateTime eventStart);
    List<EventDTO> findEventsByHost(String eventHost);
    List<EventDTO> findEventsByLocation(String eventLocation);
    List<EventDTO> findEventsByTags(String tag);
    List<EventDTO> findEventsByType(String eventType);

    List<EventDTO> findEventsByCurrentWeek();

    List<EventDTO> findEventsByCurrentMonth();

    List<EventDTO> findEventsByTicketType(String type);

    List<EventDTO> searchEventsByMultipleFilters(String eventCategory, String eventLocation, String eventStart, String ticketType);

    List<EventDTO> findEventsByNameAndLocation(String name, String location);
    List<EventDTO> searchEventsByNameAndCity(String searchTerm, String cityKey);

    @Transactional
    ResponseEntity<Response> saveEventToDB(EventDTO eventDTO);

    List<EventDTO> getAllEventByHost(String email);

    List<EventDTO> topEventsByTicketsSold();

    List<EventDTO> top10FavoriteEvents();

    List<String> top10Cities();

    List<EventDTO> getEventsByUSer(int userId);

    Response deleteEventAndRefunds(HttpServletRequest request, int eventId) throws Exception;
    List<Event> findByUserUserId(int userId);
    List<Event> findByUserUserIdAndYear(int userId, int year);
    Set<EventDTO> findEventsByPreferredEventTypes(String email);

    Set<EventDTO> findEventsByPreferredTags(String email);

    List<EventDTO> findEventsByPreferredTypesAndTags(String email);

    List<String> getAllTags();

    void recordEventView(Integer eventId, Integer userId);

    List<EventViewDTO> getTopViewedEvents(int limit);

    Response publishEvent(int eventId);

    Response reportEvent(int eventId, String reason);

    Response reopenEvent(int eventId);

    String getEventViewsAsCSV();
}
