package hcmute.fit.event_management.controller.manager;

import hcmute.fit.event_management.dto.*;
import hcmute.fit.event_management.entity.Event;
import hcmute.fit.event_management.entity.EventType;
import hcmute.fit.event_management.entity.User;
import hcmute.fit.event_management.repository.EventRepository;
import hcmute.fit.event_management.repository.EventTypeRepository;
import hcmute.fit.event_management.repository.OrganizerRepository;
import hcmute.fit.event_management.service.*;
import hcmute.fit.event_management.service.Impl.EventServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.http.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import payload.Response;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/events")
public class EventController {
    @Autowired
    private EventServiceImpl eventService;

    @Autowired
    private ISegmentService segmentService;

    @Autowired
    private ITicketService ticketService;

    @Autowired
    private ISponsorService sponsorService;
    @Autowired
    private IOrganizerService organizerService;

    @Autowired
    private SimpMessagingTemplate template;

    @Autowired
    private EventTypeRepository eventTypeRepository;

    @Autowired
    private IUserService userService;
    @Autowired
    private INotificationService notificationService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private IFollowService followService;

    @Autowired
    private EventRepository eventRepository;
    private static final Logger logger = LoggerFactory.getLogger(EventController.class);
    @PostMapping("/create")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<Response> createEvent(@RequestBody EventDTO event) throws IOException {
        // Gán trạng thái mặc định nếu không được cung cấp
        if (event.getEventStatus() == null || event.getEventStatus().isEmpty()) {
            event.setEventStatus("Draft");
        }
        // Create notification for Organizer
        NotificationDTO notificationDTO = new NotificationDTO();
        notificationDTO.setTitle("New Event");
        notificationDTO.setMessage(event.getEventName() + " was successfully created");
        notificationDTO.setUserId(event.getUserId());
        notificationDTO.setRead(false);
        notificationDTO.setCreatedAt(new Date());
        notificationService.createNotification(notificationDTO);

        // Save event and get response
        ResponseEntity<Response> response = eventService.saveEventToDB(event);
        if (response.getStatusCode() == HttpStatus.CREATED) {
            // Get created event
            EventDTO createdEvent = (EventDTO) response.getBody().getData();
            // Get Organizer's ID
            OrganizerDTO organizer = organizerService.getOrganizerInforByEventHost(event.getEventHost());
            if (organizer != null && organizer.getOrganizerId() > 0 && "public".equals(createdEvent.getEventStatus())) {
                List<User> followers = followService.getFollowers(organizer.getOrganizerId());
                List<UserDTO> followersDTO = new ArrayList<>();
                for (User user : followers) {
                    UserDTO userDTO = new UserDTO();
                    BeanUtils.copyProperties(user, userDTO);
                    followersDTO.add(userDTO);
                }
                // Send email to each follower only if event is public
                String eventUrl = "http://localhost:3000/event/" + createdEvent.getEventId();
                String eventLocation = createdEvent.getEventLocation().getVenueName() + ", " +
                        createdEvent.getEventLocation().getAddress() + ", " +
                        createdEvent.getEventLocation().getCity();
                for (UserDTO follower : followersDTO) {
                    try {
                        emailService.sendNewEventNotification(
                                follower.getEmail(),
                                createdEvent.getEventName(),
                                createdEvent.getEventStart().toString(),
                                eventLocation,
                                eventUrl
                        );
                    } catch (Exception e) {
                        System.err.println("Failed to send email to " + follower.getEmail() + ": " + e.getMessage());
                    }
                }
            }
        }

        return response;
    }
    @PutMapping("/publish/{eventId}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<Response> publishEvent(@PathVariable int eventId) {
        Response response = eventService.publishEvent(eventId);

        // Kiểm tra nếu xuất bản thành công và trạng thái là public
        if (response.getStatusCode() == 200 && response.getData() instanceof EventDTO) {
            EventDTO publishedEvent = (EventDTO) response.getData();
            if ("public".equals(publishedEvent.getEventStatus())) {
                // Lấy thông tin tổ chức
                OrganizerDTO organizer = organizerService.getOrganizerInforByEventHost(publishedEvent.getEventHost());
                if (organizer != null && organizer.getOrganizerId() > 0) {
                    // Lấy danh sách người theo dõi
                    List<User> followers = followService.getFollowers(organizer.getOrganizerId());
                    List<UserDTO> followersDTO = new ArrayList<>();
                    for (User user : followers) {
                        UserDTO userDTO = new UserDTO();
                        BeanUtils.copyProperties(user, userDTO);
                        followersDTO.add(userDTO);
                    }

                    // Gửi email thông báo cho từng người theo dõi
                    String eventUrl = "http://localhost:3000/event/" + publishedEvent.getEventId();
                    String eventLocation = publishedEvent.getEventLocation().getVenueName() + ", " +
                            publishedEvent.getEventLocation().getAddress() + ", " +
                            publishedEvent.getEventLocation().getCity();
                    for (UserDTO follower : followersDTO) {
                        try {
                            emailService.sendNewEventNotification(
                                    follower.getEmail(),
                                    publishedEvent.getEventName(),
                                    publishedEvent.getEventStart().toString(),
                                    eventLocation,
                                    eventUrl
                            );
                        } catch (Exception e) {
                            System.err.println("Failed to send email to " + follower.getEmail() + ": " + e.getMessage());
                        }
                    }
                }

                // Tạo thông báo cho tổ chức
                NotificationDTO notificationDTO = new NotificationDTO();
                notificationDTO.setTitle("Sự kiện được xuất bản");
                notificationDTO.setMessage(publishedEvent.getEventName() + " đã được xuất bản thành công");
                notificationDTO.setUserId(publishedEvent.getUserId());
                notificationDTO.setRead(false);
                notificationDTO.setCreatedAt(new Date());
                notificationService.createNotification(notificationDTO);
            }
        }

        return ResponseEntity.ok(response);
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

        EventDetailDTO detailDTO = new EventDetailDTO();
        detailDTO.setEvent(eventService.getEventById(eventId));
        detailDTO.setTickets(ticketService.getTicketsByEventId(eventId));
        detailDTO.setSegments(segmentService.getAllSegments(eventId));
        if(sponsorService.getAllSponsorsInEvent(eventId) != null){
            detailDTO.setSponsors(sponsorService.getAllSponsorsInEvent(eventId));
        }
        UserDTO organizer = userService.findById(detailDTO.getEvent().getUserId());
        if(detailDTO.getEvent() != null && detailDTO.getEvent().getEventHost() != null) {
            String eventHost = detailDTO.getEvent().getEventHost();
            OrganizerDTO infor = organizerService.getOrganizerInforByEventHost(eventHost);
            infor.setOrganizerEmail(organizer.getEmail());
            detailDTO.setOrganizer(infor);
        }
        return ResponseEntity.ok(detailDTO);
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
    public ResponseEntity<Response> deleteEvent(HttpServletRequest request,@PathVariable int eventId) throws Exception {

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
        try {
            List<EventDTO> results = eventService.searchEventsByNameAndCity(searchTerm, cityKey);
            return ResponseEntity.ok(results);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
    @GetMapping("search/by-type/{categoryName}")
    public ResponseEntity<List<EventDTO>> searchEventsByEventType(@PathVariable String categoryName){
        List<EventDTO> eventsSearchByType = eventService.findEventsByType(categoryName);
        return ResponseEntity.ok(eventsSearchByType);
    }
    @GetMapping("search/by-city/{city}")
    public ResponseEntity<List<EventDTO>> searchEventsByCity(@PathVariable String city){
        List<EventDTO> events = eventService.findEventsByLocation( city );
        return ResponseEntity.ok(events);
    }
    @GetMapping("/get-all-event-by-org/{email}")
    public ResponseEntity<List<EventDTO>> getAllEventsByOrg(@PathVariable String email){
        List<EventDTO> events = eventService.getAllEventByHost(email);
        return ResponseEntity.ok(events);
    }
    @GetMapping("search/by-host/{eventHost}")
    public ResponseEntity<List<EventDTO>> searchEventsByHost(@PathVariable String eventHost){
        List<EventDTO> events = eventService.findEventsByHost(eventHost);
        return ResponseEntity.ok(events);
    }
    @GetMapping("search/by-tag/{tag}")
    public ResponseEntity<List<EventDTO>> searchEventsByTag(@PathVariable String tag){
        List<EventDTO> events = eventService.findEventsByTags(tag);
        return ResponseEntity.ok(events);
    }
    @GetMapping("/search/by-name/{eventName}")
    public ResponseEntity<List<EventDTO>> searchEventsByName(@PathVariable String eventName){
        List<EventDTO> events = eventService.findEventsByName(eventName);
        return ResponseEntity.ok(events);
    }
    @GetMapping("/search/by-status/{eventStatus}")
    public ResponseEntity<List<EventDTO>> searchEventsByStatus(@PathVariable String eventStatus){
        List<EventDTO> events = eventService.findEventsStatus(eventStatus);
        return ResponseEntity.ok(events);
    }
    @GetMapping("/search/by-event-start/{eventStart}")
    public ResponseEntity<List<EventDTO>> searchEventsByEventStart(@PathVariable LocalDateTime eventStart){
        List<EventDTO> events = eventService.findEventsByDate(eventStart);
        return ResponseEntity.ok(events);
    }
    @GetMapping("/search/upcoming")
    public ResponseEntity<List<EventDTO>> searchEventsUpComming(){
        List<EventDTO> events = eventService.findEventsByCurrentMonth();
        return ResponseEntity.ok(events);
    }
    @GetMapping("/search/multiple-filters")
    public List<EventDTO> searchEventsByMultipleFilters(
            @RequestParam(required = false) String eventCategory,
            @RequestParam(required = false) String eventLocation,
            @RequestParam(required = false) String eventStart,
            @RequestParam(required = false) String ticketType) {
        return eventService.searchEventsByMultipleFilters(eventCategory, eventLocation, eventStart, ticketType);
    }
    @GetMapping("/search/events-by-tickets-sold")
    public List<EventDTO> bestEventsByTicketsSold() {
        return eventService.topEventsByTicketsSold();
    }
    @GetMapping("/search/events-by-favorites")
    public List<EventDTO> findTop10FavoriteEvents() {
        return eventService.top10FavoriteEvents();
    }

    @GetMapping("/search/organizer-infor/{organizer}")
    public ProfileOrganizerDTO eventOfOrganizer(@PathVariable String organizer) {
        List<EventDTO> events = eventService.findEventsByHost(organizer);
        OrganizerDTO organizerDTO = organizerService.getOrganizerInforByEventHost(organizer);

        ProfileOrganizerDTO profile = new ProfileOrganizerDTO(organizerDTO,events);
        return profile;

    }
    @GetMapping("/search/top-cities-popular")
    public List<String> topCitiesPopular() {
        return eventService.top10Cities();
    }
    @GetMapping("/recommended/{email}")
    public ResponseEntity<List<EventDTO>> getRecommendedEvents(@PathVariable String email) {
        List<EventDTO> events = eventService.findEventsByPreferredTypesAndTags(email);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/recommended/by-types/{email}")
    public ResponseEntity<Set<EventDTO>> getEventsByPreferredTypes(@PathVariable String email) {
        Set<EventDTO> events = eventService.findEventsByPreferredEventTypes(email);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/recommended/by-tags/{email}")
    public ResponseEntity<Set<EventDTO>> getEventsByPreferredTags(@PathVariable String email) {
        Set<EventDTO> events = eventService.findEventsByPreferredTags(email);
        return ResponseEntity.ok(events);
    }
    @GetMapping("/search/all-tags")
    public ResponseEntity<List<String>> getAllTags() {
        List<String> tags = eventService.getAllTags();
        return ResponseEntity.ok(tags);
    }
    @GetMapping("get-all-event-types")
    public ResponseEntity<List<EventTypeDTO>> getAllTypes() {
        List<EventType> list = eventTypeRepository.findAll();
        List<EventTypeDTO> listDTO = new ArrayList<>();
        for (EventType eventType : list) {
            EventTypeDTO type = new EventTypeDTO();
            type.setId(eventType.getId());
            type.setTypeName(eventType.getTypeName());
            listDTO.add(type);
        }
        return ResponseEntity.ok(listDTO);
    }
    @GetMapping("/top-viewed")
    public ResponseEntity<List<EventViewDTO>> getTopViewedEvents(@RequestParam(defaultValue = "5") int limit) {
        List<EventViewDTO> topEvents = eventService.getTopViewedEvents(limit);
        return ResponseEntity.ok(topEvents);
    }

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String RECOMMENDATION_API_URL = "http://localhost:5000/recommendations";

    @PostMapping("/recommended/{userId}")
    public ResponseEntity<List<EventDTO>> getRecommendedEventsByModel(@PathVariable int userId) {
        try {
            // Kiểm tra userId tồn tại
            UserDTO user = userService.findById(userId);
            if (user.getUserId() == 0) {
                logger.warn("User not found for userId: {}", userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ArrayList<>());
            }

            // Lấy danh sách tất cả eventId từ cơ sở dữ liệu
            List<Integer> allEventIds = eventRepository.getAllEventIDs();
            if (allEventIds.isEmpty()) {
                logger.warn("No events found in database");
                return ResponseEntity.ok(new ArrayList<>());
            }

            // Tạo payload cho API /recommendations
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("userId", userId);
            requestBody.put("allEventIds", allEventIds);

            // Gửi yêu cầu tới API /recommendations
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    RECOMMENDATION_API_URL,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            // Xử lý phản hồi từ API
            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                logger.error("Failed to get recommendations from Python API, status: {}", response.getStatusCode());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ArrayList<>());
            }

            List<Integer> recommendedEventIds = (List<Integer>) response.getBody().get("eventIds");
            if (recommendedEventIds == null || recommendedEventIds.isEmpty()) {
                logger.info("No recommendations returned for userId: {}", userId);
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
            logger.info("Retrieved {} active event IDs", activeEventIds.size());
            return ResponseEntity.ok(activeEventIds);
        } catch (Exception e) {
            logger.error("Failed to fetch active event IDs", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ArrayList<>());
        }
    }
}