package hcmute.fit.event_management.service;

import hcmute.fit.event_management.dto.EventDTO;
import hcmute.fit.event_management.dto.EventViewDTO;
import hcmute.fit.event_management.entity.Event;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

public interface EventSearchService {

    List<EventDTO> findEventsByName(String eventName);

    List<EventDTO> findEventsStatus(String eventStatus);

    List<EventDTO> findEventsByDate(LocalDateTime eventStart);

    List<EventDTO> findEventsByHost(String eventHost);

    List<EventDTO> findEventsByLocation(String eventLocation);

    List<EventDTO> findEventsByTags(String tag);

    List<EventDTO> findEventsByType(String eventType);

    List<EventDTO> findEventsByCurrentMonth();

    List<EventDTO> searchEventsByMultipleFilters(String eventCategory, String eventLocation, String eventStart, String ticketType);

    List<EventDTO> findEventsByNameAndLocation(String name, String location);

    List<EventDTO> searchEventsByNameAndCity(String searchTerm, String cityKey);

    List<EventDTO> getAllEventByHost(String email);

    List<EventDTO> topEventsByTicketsSold();

    List<EventDTO> top10FavoriteEvents();

    List<String> top10Cities();

    List<EventDTO> getEventsByUSer(int userId);

    List<Event> findByUserUserId(int userId);

    List<Event> findByUserUserIdAndYear(int userId, int year);

    Set<EventDTO> findEventsByPreferredEventTypes(String email);

    Set<EventDTO> findEventsByPreferredTags(String email);

    List<EventDTO> findEventsByPreferredTypesAndTags(String email);

    List<EventViewDTO> getTopViewedEvents(int limit);
}
