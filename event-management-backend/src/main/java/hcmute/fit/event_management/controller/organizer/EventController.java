package hcmute.fit.event_management.controller.organizer;

import hcmute.fit.event_management.dto.*;
import hcmute.fit.event_management.entity.Event;
import hcmute.fit.event_management.entity.EventType;
import hcmute.fit.event_management.entity.User;
import hcmute.fit.event_management.mapper.EventDetailMapper;
import hcmute.fit.event_management.repository.EventRepository;
import hcmute.fit.event_management.repository.EventTypeRepository;
import hcmute.fit.event_management.service.*;
import hcmute.fit.event_management.service.Impl.EventServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import payload.Response;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/events")

public class EventController {
    private final EmailService emailService;

    private final FollowService followService;

    private final EventRepository eventRepository;

    private final EventTypeService eventTypeService;

    private final EventDetailMapper eventDetailMapper;

    private final EventServiceImpl eventService;

    private final OrganizerService organizerService;

    private final EventSearchService eventSearchService;

    private final NotificationService notificationService;

    private final UserService userService;



    public EventController(EmailService emailService, EventServiceImpl eventService,
                           OrganizerService organizerService, EventSearchService eventSearchService,
                           NotificationService notificationService, FollowService followService,
                           EventRepository eventRepository, EventTypeService eventTypeService,
                           EventDetailMapper eventDetailMapper, UserService userService) {
        this.emailService = emailService;
        this.eventService = eventService;
        this.organizerService = organizerService;
        this.eventSearchService = eventSearchService;
        this.notificationService = notificationService;
        this.followService = followService;
        this.eventRepository = eventRepository;
        this.eventTypeService = eventTypeService;
        this.eventDetailMapper = eventDetailMapper;
        this.userService = userService;
    }

    private static final Logger logger = LoggerFactory.getLogger(EventController.class);


    @PostMapping("/create")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<Response> createEvent(@RequestBody EventDTO event) {


        notificationService.createNotification("New event",event.getEventName(),event.getUserId() );

        // Save event and get response
        ResponseEntity<Response> response = eventService.saveEventToDB(event);
        if (response.getStatusCode() == HttpStatus.CREATED) {
            notificationService.sendNotification(response);
        }

        return response;
    }

    @PutMapping("/publish/{eventId}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<Response> publishEvent(@PathVariable int eventId) {
        ResponseEntity<Response> response = eventService.publishEvent(eventId);


        if (response.getStatusCode() == HttpStatus.CREATED) {

            notificationService.sendNotification(response);
        }

        return response;
    }

    @PostMapping("/reopen/{eventId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Response> reopenEvent(@PathVariable int eventId) {
        Response response = eventService.reopenEvent(eventId);
        return ResponseEntity.status(response.getStatusCode() == 200 ? HttpStatus.OK : HttpStatus.BAD_REQUEST)
                .body(response);
    }
    @PostMapping("/create-event")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<Response> saveEvent(@RequestBody EventDTO event)  {
        return eventService.saveEventToDB(event);
    }

    @GetMapping("/all")
    public ResponseEntity<List<EventDTO>> getAllEvents() {
        List<EventDTO> events = eventService.getAllEvent();
        return ResponseEntity.ok(events);
    }

    @GetMapping("detail/{eventId}")
    public ResponseEntity<EventDetailDTO> getEventById(@PathVariable int eventId,@RequestParam(required = false) Integer userId) {
        // Ghi lại lượt xem
        if(userId !=null) eventService.recordEventView(eventId, userId);

        return ResponseEntity.ok(eventDetailMapper.toDto(eventId));
    }

    @PostMapping("/report/{eventId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Response> reportEvent(@PathVariable int eventId, @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        if (reason == null || reason.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new Response(400, "Bad Request", "Reason for reporting is required"));
        }
        Response response = eventService.reportEvent(eventId, reason);
        return ResponseEntity.status(response.getStatusCode() == 200 ? HttpStatus.OK : HttpStatus.BAD_REQUEST)
                .body(response);
    }

    @PutMapping("/edit")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<EventEditDTO> editEvent( @RequestBody EventEditDTO eventEditDTO) throws Exception {
        EventEditDTO eventEdit = eventService.saveEditEvent(eventEditDTO);
        return ResponseEntity.ok(eventEdit);
    }

    @DeleteMapping("/delete/{eventId}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<Response> deleteEvent(HttpServletRequest request,@PathVariable int eventId)
            throws Exception {

        return ResponseEntity.ok(eventService.deleteEventAndRefunds(request,eventId));
    }

    @GetMapping("/edit/{eventId}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<EventEditDTO> editEvent(@PathVariable int eventId) {
        EventEditDTO eventEdit = eventService.getEventAfterEdit(eventId);
        return ResponseEntity.ok(eventEdit);
    }

    @GetMapping("/search/by-name-and-city")
    public ResponseEntity<List<EventDTO>> searchEventsByNameAndCity(
            @RequestParam("term") String searchTerm,
            @RequestParam("city") String cityKey) {

            List<EventDTO> results = eventSearchService.searchEventsByNameAndCity(searchTerm, cityKey);
            return ResponseEntity.ok(results);

    }

    @GetMapping("search/by-type/{categoryName}")
    public ResponseEntity<List<EventDTO>> searchEventsByEventType(@PathVariable String categoryName){
        List<EventDTO> eventsSearchByType = eventSearchService.findEventsByType(categoryName);
        return ResponseEntity.ok(eventsSearchByType);
    }

    @GetMapping("search/by-city/{city}")
    public ResponseEntity<List<EventDTO>> searchEventsByCity(@PathVariable String city){
        List<EventDTO> events = eventSearchService.findEventsByLocation( city );
        return ResponseEntity.ok(events);
    }

    @GetMapping("/get-all-event-by-org/{email}")
    public ResponseEntity<List<EventDTO>> getAllEventsByOrg(@PathVariable String email){
        List<EventDTO> events = eventSearchService.getAllEventByHost(email);
        return ResponseEntity.ok(events);
    }

    @GetMapping("search/by-host/{eventHost}")
    public ResponseEntity<List<EventDTO>> searchEventsByHost(@PathVariable String eventHost){
        List<EventDTO> events = eventSearchService.findEventsByHost(eventHost);
        return ResponseEntity.ok(events);
    }

    @GetMapping("search/by-tag/{tag}")
    public ResponseEntity<List<EventDTO>> searchEventsByTag(@PathVariable String tag){
        List<EventDTO> events = eventSearchService.findEventsByTags(tag);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/search/by-name/{eventName}")
    public ResponseEntity<List<EventDTO>> searchEventsByName(@PathVariable String eventName){
        List<EventDTO> events = eventSearchService.findEventsByName(eventName);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/search/by-status/{eventStatus}")
    public ResponseEntity<List<EventDTO>> searchEventsByStatus(@PathVariable String eventStatus){
        List<EventDTO> events = eventSearchService.findEventsStatus(eventStatus);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/search/by-event-start/{eventStart}")
    public ResponseEntity<List<EventDTO>> searchEventsByEventStart(@PathVariable LocalDateTime eventStart){
        List<EventDTO> events = eventSearchService.findEventsByDate(eventStart);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/search/upcoming")
    public ResponseEntity<List<EventDTO>> searchEventsUpComming(){
        List<EventDTO> events = eventSearchService.findEventsByCurrentMonth();
        return ResponseEntity.ok(events);
    }

    @GetMapping("/search/multiple-filters")
    public List<EventDTO> searchEventsByMultipleFilters(
            @RequestParam(required = false) String eventCategory,
            @RequestParam(required = false) String eventLocation,
            @RequestParam(required = false) String eventStart,
            @RequestParam(required = false) String ticketType) {
        return eventSearchService.searchEventsByMultipleFilters(eventCategory, eventLocation, eventStart, ticketType);
    }

    @GetMapping("/search/events-by-tickets-sold")
    public List<EventDTO> bestEventsByTicketsSold() {
        return eventSearchService.topEventsByTicketsSold();
    }

    @GetMapping("/search/events-by-favorites")
    public List<EventDTO> findTop10FavoriteEvents() {
        return eventSearchService.top10FavoriteEvents();
    }

    @GetMapping("/search/organizer-infor/{organizer}")
    public ProfileOrganizerDTO eventOfOrganizer(@PathVariable String organizer) {
        List<EventDTO> events = eventSearchService.findEventsByHost(organizer);
        OrganizerDTO organizerDTO = organizerService.getOrganizerInforByEventHost(organizer);

        ProfileOrganizerDTO profile = new ProfileOrganizerDTO(organizerDTO,events);
        return profile;

    }

    @GetMapping("/search/top-cities-popular")
    public List<String> topCitiesPopular() {
        return eventSearchService.top10Cities();
    }

    @GetMapping("/recommended/{email}")
    public ResponseEntity<List<EventDTO>> getRecommendedEvents(@PathVariable String email) {
        List<EventDTO> events = eventSearchService.findEventsByPreferredTypesAndTags(email);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/recommended/by-types/{email}")
    public ResponseEntity<Set<EventDTO>> getEventsByPreferredTypes(@PathVariable String email) {
        Set<EventDTO> events = eventSearchService.findEventsByPreferredEventTypes(email);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/recommended/by-tags/{email}")
    public ResponseEntity<Set<EventDTO>> getEventsByPreferredTags(@PathVariable String email) {
        Set<EventDTO> events = eventSearchService.findEventsByPreferredTags(email);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/search/all-tags")
    public ResponseEntity<List<String>> getAllTags() {
        List<String> tags = eventService.getAllTags();
        return ResponseEntity.ok(tags);
    }

    @GetMapping("get-all-event-types")
    public ResponseEntity<List<EventTypeDTO>> getAllTypes() {
        List<EventTypeDTO> types = eventTypeService.getAllEventTypes();
        return ResponseEntity.ok(types);
    }


    @GetMapping("/top-viewed")
    public ResponseEntity<List<EventViewDTO>> getTopViewedEvents(@RequestParam(defaultValue = "5") int limit) {
        List<EventViewDTO> topEvents = eventSearchService.getTopViewedEvents(limit);
        return ResponseEntity.ok(topEvents);
    }

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String RECOMMENDATION_API_URL = "http://localhost:5000/recommendations";

    @PostMapping("/recommended/{userId}")
    public ResponseEntity<List<EventDTO>> getRecommendedEventsByModel(@PathVariable int userId) {
        try {

            UserDTO user = userService.findById(userId);
            if (user.getUserId() == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ArrayList<>());
            }


            List<Integer> allEventIds = eventRepository.getAllEventIDs();
            if (allEventIds.isEmpty()) {
                return ResponseEntity.ok(new ArrayList<>());
            }


            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("userId", userId);
            requestBody.put("allEventIds", allEventIds);


            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    RECOMMENDATION_API_URL,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );


            List<Integer> recommendedEventIds = (List<Integer>) response.getBody().get("eventIds");
            if (recommendedEventIds == null || recommendedEventIds.isEmpty()) {

                return ResponseEntity.ok(new ArrayList<>());
            }

            // Lấy danh sách sự kiện từ danh sách eventIds
            List<EventDTO> recommendedEvents = new ArrayList<>();
            for (Integer eventId : recommendedEventIds) {
                EventDTO eventDTO = eventService.getEventById(eventId);
                if (eventDTO.getEventId() != 0) {
                    recommendedEvents.add(eventDTO);
                }
            }
            return ResponseEntity.ok(eventService.sortEventsByStartTime(recommendedEvents));

        } catch (Exception e) {
            logger.error("Error in getRecommendedEventsByModel for userId: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ArrayList<>());
        }
    }

    @PostMapping("/export-event-views")
    public ResponseEntity<String> exportEventViews() {
        try {
            String csvContent = eventService.getEventViewsAsCSV();
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_TYPE, "text/csv");
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=event_views.csv");
            logger.info("Event views exported successfully");
            return new ResponseEntity<>(csvContent, headers, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Failed to export event views", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to export event views");
        }
    }

    @GetMapping("/active-ids")
    public ResponseEntity<List<Integer>> getActiveEventIds() {
        try {
            List<Integer> activeEventIds = eventRepository.findAll().stream()
                    .filter(event -> !"Complete".equals(event.getEventStatus()) &&
                            !"Draft".equals(event.getEventStatus()) &&
                            event.getEventEnd().isAfter(LocalDateTime.now()))
                    .map(Event::getEventID)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(activeEventIds);
        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ArrayList<>());
        }
    }
}