package hcmute.fit.event_management.service.Impl;


import hcmute.fit.event_management.dto.EventDTO;
import hcmute.fit.event_management.dto.EventViewDTO;
import hcmute.fit.event_management.entity.Event;
import hcmute.fit.event_management.entity.EventType;
import hcmute.fit.event_management.entity.User;
import hcmute.fit.event_management.mapper.EventMapper;
import hcmute.fit.event_management.repository.EventRepository;
import hcmute.fit.event_management.repository.EventTypeRepository;
import hcmute.fit.event_management.repository.EventViewRepository;
import hcmute.fit.event_management.repository.UserRepository;
import hcmute.fit.event_management.service.EventSearchService;
import hcmute.fit.event_management.service.EventService;
import hcmute.fit.event_management.util.VietnamCities;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EventSearchServiceImpl implements EventSearchService {

    private final EventService eventService;
    private final EventRepository eventRepository;
    private final EventViewRepository eventViewRepository;
    private final EventTypeRepository eventTypeRepository;
    private final UserRepository userRepository;
    private final EventMapper eventMapper;

    public EventSearchServiceImpl(EventService eventService, EventRepository eventRepository,
                                  EventViewRepository eventViewRepository,
                                  EventTypeRepository eventTypeRepository, UserRepository userRepository,
                                  EventMapper eventMapper) {
        this.eventService = eventService;
        this.eventRepository = eventRepository;

        this.eventViewRepository = eventViewRepository;
        this.eventTypeRepository = eventTypeRepository;
        this.userRepository = userRepository;
        this.eventMapper = eventMapper;
    }


    @Override
    public List<Event> findByUserUserId(int userId) {
        return List.of();
    }

    @Override
    public List<EventDTO> findEventsByName(String eventName) {

        List<Event> events = eventRepository.findByEventNameContainingIgnoreCase(eventName);
        List<EventDTO> eventDTOs = events.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(eventMapper::toDto).collect(Collectors.toList());

        return eventService.sortEventsByStartTime(eventDTOs);
    }

    @Override
    public List<EventDTO> findEventsStatus(String eventStatus) {

        List<Event> events = eventRepository.findByEventStatusIgnoreCase(eventStatus);
        List<EventDTO> eventDTOs = events.stream()
                // .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(eventMapper::toDto).collect(Collectors.toList());

        return eventService.sortEventsByStartTime(eventDTOs);
    }

    @Override
    public List<EventDTO> findEventsByDate(LocalDateTime eventStart) {

        List<Event> events = eventRepository.findByEventStart(eventStart);
        List<EventDTO> eventDTOs = events.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(eventMapper::toDto).collect(Collectors.toList());
        return eventService.sortEventsByStartTime(eventDTOs);
    }

    @Override
    public List<EventDTO> findEventsByHost(String eventHost) {

        List<Event> events = eventRepository.findByEventHostContainingIgnoreCase(eventHost);
        List<EventDTO> eventDTOs = events.stream()
                .filter(event ->  !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(eventMapper::toDto).collect(Collectors.toList());
        return eventService.sortEventsByStartTime(eventDTOs);
    }

    @Override
    public List<EventDTO> findEventsByLocation(String eventLocation) {

        List<Event> events = eventRepository.findByEventLocationCityContainingIgnoreCase(eventLocation);
        List<EventDTO> eventDTOs = events.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(eventMapper::toDto).collect(Collectors.toList());
        return eventService.sortEventsByStartTime(eventDTOs);
    }

    @Override
    public List<EventDTO> findEventsByTags(String tag) {

        List<Event> events = eventRepository.findByTagsContainingIgnoreCase(tag);
        List<EventDTO> eventDTOs = events.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(eventMapper::toDto).collect(Collectors.toList());
        return eventService.sortEventsByStartTime(eventDTOs);
    }

    @Override
    public List<EventDTO> findEventsByType(String eventType) {

        EventType type = eventTypeRepository.findByTypeName(eventType);
        if (type == null) {

            return new ArrayList<>();
        }
        List<Event> events = eventRepository.findByEventType(type);
        List<EventDTO> eventDTOs = events.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(eventMapper::toDto).collect(Collectors.toList());
        return eventService.sortEventsByStartTime(eventDTOs);
    }

    @Override
    public List<EventDTO> findEventsByCurrentMonth() {

        List<Event> events = eventRepository.findEventsByCurrentMonth();
        List<EventDTO> eventDTOs = events.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(eventMapper::toDto).collect(Collectors.toList());
        return eventService.sortEventsByStartTime(eventDTOs);
    }

    @Override
    public List<EventDTO> searchEventsByMultipleFilters(String eventCategory, String eventLocation, String eventStart, String ticketType) {

        List<Event> resultEvents = eventRepository.findAll();

        if (eventCategory != null && !eventCategory.equals("all-types")) {
            EventType type = eventTypeRepository.findByTypeName(eventCategory);
            if (type != null) {
                List<Event> categoryEvents = eventRepository.findByEventType(type);
                resultEvents = resultEvents.stream()

                        .filter(categoryEvents::contains)
                        .collect(Collectors.toList());
            } else {
                resultEvents = new ArrayList<>();
            }
        }

        if (eventLocation != null && !eventLocation.equals("all-locations")) {
            List<Event> locationEvents = eventRepository.findByEventLocationCityContainingIgnoreCase(eventLocation);
            resultEvents = resultEvents.stream()
                    .filter(locationEvents::contains)
                    .collect(Collectors.toList());
        }

        if (eventStart != null && !eventStart.equals("all-times")) {
            List<Event> timeEvents;
            if (eventStart.equals("this-week")) {
                timeEvents = eventRepository.findEventsByCurrentWeek();
            } else if (eventStart.equals("this-month")) {
                timeEvents = eventRepository.findEventsByCurrentMonth();
            } else {
                timeEvents = eventRepository.findAll();
            }
            resultEvents = resultEvents.stream()
                    .filter(timeEvents::contains)
                    .collect(Collectors.toList());
        }

        if (ticketType != null && !ticketType.equals("all-types")) {
            List<Event> ticketEvents = eventRepository.findEventsByTicketType(ticketType);
            resultEvents = resultEvents.stream()
                    .filter(ticketEvents::contains)
                    .collect(Collectors.toList());
        }

        List<EventDTO> eventDTOs = resultEvents.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(eventMapper::toDto).collect(Collectors.toList());
        return eventService.sortEventsByStartTime(eventDTOs);
    }

    @Override
    public List<EventDTO> findEventsByNameAndLocation(String name, String location) {

        List<Event> eventsByLocation = eventRepository.findByEventLocationCityContainingIgnoreCase(location);
        List<Event> filteredEvents = eventsByLocation.stream()
                .filter(event -> event.getEventName() != null &&
                        event.getEventName().toLowerCase().contains(name.toLowerCase()) &&
                        !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .toList();
        List<EventDTO> eventDTOs = filteredEvents.stream()
                .map(eventMapper::toDto).collect(Collectors.toList());
        return eventService.sortEventsByStartTime(eventDTOs);
    }

    @Override
    public List<EventDTO> searchEventsByNameAndCity(String searchTerm, String cityKey) {

        List<Event> filteredEvents ;
        if ("all-locations".equals(cityKey)) {
            filteredEvents = eventRepository.findByEventNameContainingIgnoreCase(searchTerm);
        } else {
            filteredEvents = eventRepository
                    .findByEventNameContainingIgnoreCaseAndEventLocationCityContainingIgnoreCase(searchTerm, cityKey);
        }
        List<EventDTO> eventDTOs = filteredEvents.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(eventMapper::toDto).collect(Collectors.toList());
        return eventService.sortEventsByStartTime(eventDTOs);
    }

    @Override
    public List<EventDTO> getAllEventByHost(String email) {

        Optional<User> host = userRepository.findByEmail(email);
        if (host.isEmpty()) {

            return new ArrayList<>();
        }
        User organizer = host.get();
        if (organizer.getOrganizer() == null) {

            return new ArrayList<>();
        }
        List<Event> events = eventRepository.findByEventHost(organizer.getOrganizer().getOrganizerName());
        List<EventDTO> eventDTOs = events.stream()
                .map(eventMapper::toDto).collect(Collectors.toList());
        return eventService.sortEventsByStartTime(eventDTOs);
    }

    @Override
    public List<EventDTO> topEventsByTicketsSold() {

        Pageable pageable = PageRequest.of(0, 10);
        List<Event> topEvents = eventRepository.findTopEventsByTicketsSold("PAID", "SUCCESSFULLY", pageable);
        List<EventDTO> topEventDTO = topEvents.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(eventMapper::toDto).collect(Collectors.toList());
        return eventService.sortEventsByStartTime(topEventDTO);
    }

    @Override
    public List<EventDTO> top10FavoriteEvents() {

        Pageable pageable = PageRequest.of(0, 10);
        List<Event> topEvents = eventRepository.findTop10FavoriteEvents(pageable);
        List<EventDTO> topEventDTO = topEvents.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(eventMapper::toDto).collect(Collectors.toList());
        return eventService.sortEventsByStartTime(topEventDTO);
    }

    @Override
    public List<String> top10Cities() {
        Pageable pageable = PageRequest.of(0, 10);
        List<String> top10Cities = eventRepository.findTop10CitiesByEventCount(pageable);
        List<String> topCity = new ArrayList<>();
        for (String city : top10Cities) {
            String cityName = VietnamCities.CITY_MAP.getOrDefault(city, "Không xác định");
            topCity.add(cityName);
        }
        return topCity;
    }

    @Override
    public List<EventDTO> getEventsByUSer(int userId) {

        User organizer = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        List<Event> eventDB = eventRepository.findByUser(organizer);
        List<EventDTO> eventDTOList = eventDB.stream()

                .map(eventMapper::toDto).collect(Collectors.toList());
        return eventService.sortEventsByStartTime(eventDTOList);
    }

    @Override
    public List<Event> findByUserUserIdAndYear(int userId, int year) {
        return eventRepository.findByUserUserIdAndYear(userId, year);
    }

    @Override
    public Set<EventDTO> findEventsByPreferredEventTypes(String email) {

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {

            return new HashSet<>();
        }
        User user = userOpt.get();
        List<String> preferredEventTypes = user.getPreferredEventTypes();

        if (preferredEventTypes.isEmpty()) {
            return new HashSet<>();
        }

        List<Event> matchedEvents = new ArrayList<>();
        for (String eventType : preferredEventTypes) {
            EventType type = eventTypeRepository.findByTypeName(eventType);
            if (type != null) {
                List<Event> events = eventRepository.findByEventType(type);
                matchedEvents.addAll(events);
            }
        }

        List<EventDTO> eventDTOS = matchedEvents.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(eventMapper::toDto).toList();
        List<EventDTO> sortedEventDTOs = eventService.sortEventsByStartTime(new ArrayList<>(eventDTOS));
        return new HashSet<>(sortedEventDTOs);
    }

    @Override
    public Set<EventDTO> findEventsByPreferredTags(String email) {

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {

            return new HashSet<>();
        }
        User user = userOpt.get();
        List<String> preferredTags = user.getPreferredTags();

        if (preferredTags.isEmpty()) {
            return new HashSet<>();
        }

        List<Event> matchedEvents = new ArrayList<>();
        for (String tag : preferredTags) {
            List<Event> events = eventRepository.findByTagsContainingIgnoreCase(tag);
            matchedEvents.addAll(events);
        }

        List<EventDTO> eventDTOS = matchedEvents.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(eventMapper::toDto).toList();
        List<EventDTO> sortedEventDTOs = eventService.sortEventsByStartTime(new ArrayList<>(eventDTOS));
        return new HashSet<>(sortedEventDTOs);
    }

    @Override
    public List<EventDTO> findEventsByPreferredTypesAndTags(String email) {

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {

            return new ArrayList<>();
        }
        User user = userOpt.get();
        List<String> preferredEventTypes = user.getPreferredEventTypes();
        List<String> preferredTags = user.getPreferredTags();

        if (preferredEventTypes.isEmpty() && preferredTags.isEmpty()) {
            return new ArrayList<>();
        }

        List<Event> matchedEvents = new ArrayList<>();
        for (String eventType : preferredEventTypes) {
            EventType type = eventTypeRepository.findByTypeName(eventType);
            if (type != null) {
                List<Event> events = eventRepository.findByEventType(type);
                for (Event event : events) {
                    if (matchedEvents.stream().noneMatch(e -> e.getEventID() == event.getEventID())) {
                        matchedEvents.add(event);
                    }
                }
            }
        }

        for (String tag : preferredTags) {
            List<Event> events = eventRepository.findByTagsContainingIgnoreCase(tag);
            for (Event event : events) {
                if (matchedEvents.stream().noneMatch(e -> e.getEventID() == event.getEventID())) {
                    matchedEvents.add(event);
                }
            }
        }

        List<EventDTO> eventDTOs = matchedEvents.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(eventMapper::toDto).collect(Collectors.toList());
        return eventService.sortEventsByStartTime(eventDTOs);
    }

    @Override
    public List<EventViewDTO> getTopViewedEvents(int limit) {

        List<Object[]> results = eventViewRepository.findTopViewedEvents();
        return results.stream()
                .limit(limit)
                .map(result -> {
                    Integer eventId = (Integer) result[0];
                    Long viewCount = (Long) result[1];
                    Event event = eventRepository.findById(eventId).orElse(null);
                    if (event == null) return null;
                    EventViewDTO dto = new EventViewDTO();
                    dto.setEventId(eventId);
                    dto.setEventName(event.getEventName());
                    dto.setViewCount(viewCount);
                    return dto;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}
