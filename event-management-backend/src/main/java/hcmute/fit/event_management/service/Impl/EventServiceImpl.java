package hcmute.fit.event_management.service.Impl;

import com.cloudinary.Cloudinary;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import hcmute.fit.event_management.dto.*;
import hcmute.fit.event_management.entity.*;
import hcmute.fit.event_management.repository.*;
import hcmute.fit.event_management.service.IEventService;
import hcmute.fit.event_management.service.INotificationService;
import hcmute.fit.event_management.service.ISegmentService;
import hcmute.fit.event_management.service.ITicketService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import payload.Response;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EventServiceImpl implements IEventService {
    @Autowired
    private EventRepository eventRepository;
    @Autowired
    private EventTypeRepository eventTypeRepository;
    @Autowired
    private Cloudinary cloudinary;
    @Autowired
    private TicketRepository ticketRepository;
    @Autowired
    private SegmentRepository segmentRepository;
    @Autowired
    private ISegmentService segmentService;
    @Autowired
    private ITicketService ticketService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TransactionRepository transactionRepository;
    @Autowired
    private VNPAYService vnpayService;
    @Autowired
    private EventViewRepository eventViewRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private INotificationService notificationService;

    Logger logger = LoggerFactory.getLogger(this.getClass());
    private static final Map<String, String> cityMap = Map.ofEntries(
            Map.entry("ho-chi-minh", "TP. Hồ Chí Minh"),
            Map.entry("ha-noi", "Hà Nội"),
            Map.entry("da-nang", "Đà Nẵng"),
            Map.entry("hai-phong", "Hải Phòng"),
            Map.entry("can-tho", "Cần Thơ"),
            Map.entry("nha-trang", "Nha Trang"),
            Map.entry("da-lat", "Đà Lạt"),
            Map.entry("binh-duong", "Bình Dương"),
            Map.entry("dong-nai", "Đồng Nai"),
            Map.entry("quang-ninh", "Quảng Ninh"),
            Map.entry("bac-lieu", "Bạc Liêu"),
            Map.entry("an-giang", "An Giang"),
            Map.entry("ba-ria-vung-tau", "Bà Rịa - Vũng Tàu"),
            Map.entry("bac-giang", "Bắc Giang"),
            Map.entry("bac-kan", "Bắc Kạn"),
            Map.entry("bac-ninh", "Bắc Ninh"),
            Map.entry("ben-tre", "Bến Tre"),
            Map.entry("binh-dinh", "Bình Định"),
            Map.entry("binh-phuoc", "Bình Phước"),
            Map.entry("binh-thuan", "Bình Thuận"),
            Map.entry("ca-mau", "Cà Mau"),
            Map.entry("cao-bang", "Cao Bằng"),
            Map.entry("dak-lak", "Đắk Lắk"),
            Map.entry("dak-nong", "Đắk Nông"),
            Map.entry("dien-bien", "Điện Biên"),
            Map.entry("dong-thap", "Đồng Tháp"),
            Map.entry("gia-lai", "Gia Lai"),
            Map.entry("ha-giang", "Hà Giang"),
            Map.entry("ha-nam", "Hà Nam"),
            Map.entry("ha-tinh", "Hà Tĩnh"),
            Map.entry("hai-duong", "Hải Dương"),
            Map.entry("hau-giang", "Hậu Giang"),
            Map.entry("hoa-binh", "Hòa Bình"),
            Map.entry("hung-yen", "Hưng Yên"),
            Map.entry("khanh-hoa", "Khánh Hòa"),
            Map.entry("kien-giang", "Kiên Giang"),
            Map.entry("kon-tum", "Kon Tum"),
            Map.entry("lai-chau", "Lai Châu"),
            Map.entry("lam-dong", "Lâm Đồng"),
            Map.entry("lang-son", "Lạng Sơn"),
            Map.entry("lao-cai", "Lào Cai"),
            Map.entry("long-an", "Long An"),
            Map.entry("nam-dinh", "Nam Định"),
            Map.entry("nghe-an", "Nghệ An"),
            Map.entry("ninh-binh", "Ninh Bình"),
            Map.entry("ninh-thuan", "Ninh Thuận"),
            Map.entry("phu-tho", "Phú Thọ"),
            Map.entry("phu-yen", "Phú Yên"),
            Map.entry("quang-binh", "Quảng Bình"),
            Map.entry("quang-nam", "Quảng Nam"),
            Map.entry("quang-ngai", "Quảng Ngãi"),
            Map.entry("soc-trang", "Sóc Trăng"),
            Map.entry("son-la", "Sơn La"),
            Map.entry("tay-ninh", "Tây Ninh"),
            Map.entry("thai-binh", "Thái Bình"),
            Map.entry("thai-nguyen", "Thái Nguyên"),
            Map.entry("thanh-hoa", "Thanh Hóa"),
            Map.entry("thua-thien-hue", "Thừa Thiên Huế"),
            Map.entry("tien-giang", "Tiền Giang"),
            Map.entry("tra-vinh", "Trà Vinh"),
            Map.entry("tuyen-quang", "Tuyên Quang"),
            Map.entry("vinh-long", "Vĩnh Long"),
            Map.entry("vinh-phuc", "Vĩnh Phúc"),
            Map.entry("yen-bai", "Yên Bái")
    );

    private String getCityDisplayName(String slug) {
        return cityMap.getOrDefault(slug, slug);
    }

    @Override
    public List<EventDTO> sortEventsByStartTime(List<EventDTO> eventDTOs) {
        if (eventDTOs == null) {
            return new ArrayList<>();
        }
        return eventDTOs.stream()
                .sorted(Comparator.comparing(EventDTO::getEventStart, Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());
    }

    @Override
    public Event saveEvent(EventDTO eventDTO) throws IOException {
        Event event = new Event();
        BeanUtils.copyProperties(eventDTO, event, "eventLocation", "eventTypeId");

        EventType eventType = eventTypeRepository.findById(eventDTO.getEventTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid event type ID: " + eventDTO.getEventTypeId()));
        event.setEventType(eventType);

        EventLocation eventLocation = new EventLocation();
        EventLocationDTO locationDTO = eventDTO.getEventLocation();
        if (locationDTO != null) {
            BeanUtils.copyProperties(locationDTO, eventLocation);
            event.setEventLocation(eventLocation);
        }

        return eventRepository.save(event);
    }

    @Override
    public Optional<Event> findById(Integer eventId) {
        return eventRepository.findById(eventId);
    }

    @Override
    public EventDTO getEventById(int eventId) {
        Event event = findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));
        EventDTO dto = convertToDTO(event);
        return dto;
    }

    private void updateEventStatus() {
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfDay = today.plusDays(1).minusNanos(1);
        List<Event> events = eventRepository.findEventsForStatusUpdate(Arrays.asList("public"), endOfDay);
        List<Event> eventsToUpdate = new ArrayList<>();

        for (Event event : events) {
            if (event.getEventEnd() != null) {
                LocalDateTime eventEndDate = event.getEventEnd().withHour(0).withMinute(0).withSecond(0).withNano(0);
                if ("public".equals(event.getEventStatus()) && (eventEndDate.isBefore(today) || eventEndDate.isEqual(today))) {
                    event.setEventStatus("Complete");
                    eventsToUpdate.add(event);
                    logger.info("Updated event {} to status Complete as it has ended (end: {})",
                            event.getEventName(), event.getEventEnd());
                }
            }
        }

        if (!eventsToUpdate.isEmpty()) {
            eventRepository.saveAll(eventsToUpdate);
            logger.info("Batch updated {} events", eventsToUpdate.size());
        }
    }

    @Override
    public EventDTO convertToDTO(Event event) {
        EventDTO dto = new EventDTO();
        BeanUtils.copyProperties(event, dto, "eventLocation", "eventType");
        dto.setEventId(event.getEventID());
        dto.setEventTypeId(event.getEventType().getId());
        dto.setEventType(event.getEventType().getTypeName());
        EventLocationDTO locationDTO = new EventLocationDTO();
        if (event.getEventLocation() != null) {
            BeanUtils.copyProperties(event.getEventLocation(), locationDTO);
            locationDTO.setCity(getCityDisplayName(locationDTO.getCity()));
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

    @Override
    public List<EventDTO> getAllEvent() {
        updateEventStatus();
        List<Event> events = eventRepository.findAll();
        List<EventDTO> eventDTOs = events.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return sortEventsByStartTime(eventDTOs);
    }

    @Override
    public EventEditDTO getEventAfterEdit(int eventId) {
        EventDTO event = getEventById(eventId);
        List<Ticket> tickets = ticketRepository.findByEventID(eventId);
        List<TicketDTO> ticketDTOs = new ArrayList<>();
        for (Ticket ticket : tickets) {
            TicketDTO ticketDTO = new TicketDTO();
            BeanUtils.copyProperties(ticket, ticketDTO);
            ticketDTOs.add(ticketDTO);
        }
        List<SegmentDTO> segments = getAllSegments(eventId);
        EventEditDTO eventEdit = new EventEditDTO();
        eventEdit.setEvent(event);
        eventEdit.setTicket(ticketDTOs);
        eventEdit.setSegment(segments);
        return eventEdit;
    }

    @Override
    @Transactional
    public EventEditDTO saveEditEvent(EventEditDTO eventEditDTO) throws Exception {
        Event event = eventRepository.findById(eventEditDTO.getEvent().getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id " + eventEditDTO.getEvent().getEventId()));
        int eventId = eventEditDTO.getEvent().getEventId();

        if (eventEditDTO.getEvent().getEventStart().isAfter(eventEditDTO.getEvent().getEventEnd())) {
            logger.error("Event start time {} is after end time {}", eventEditDTO.getEvent().getEventStart(), eventEditDTO.getEvent().getEventEnd());
            throw new IllegalArgumentException("Event start time must be before end time");
        }

        BeanUtils.copyProperties(eventEditDTO.getEvent(), event, "eventLocation", "eventImages", "mediaContent", "eventTypeId");

        EventType eventType = eventTypeRepository.findById(eventEditDTO.getEvent().getEventTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid event type ID: " + eventEditDTO.getEvent().getEventTypeId()));
        event.setEventType(eventType);

        if (eventEditDTO.getEvent().getEventLocation() != null) {
            EventLocation eventLocation = new EventLocation();
            BeanUtils.copyProperties(eventEditDTO.getEvent().getEventLocation(), eventLocation);
            event.setEventLocation(eventLocation);
        }

        if (eventEditDTO.getEvent().getEventImages() != null) {
            event.getEventImages().clear();
            event.getEventImages().addAll(eventEditDTO.getEvent().getEventImages());
        }

        if (eventEditDTO.getEvent().getMediaContent() != null) {
            event.getMediaContent().clear();
            event.getMediaContent().addAll(eventEditDTO.getEvent().getMediaContent());
        }
        if(eventEditDTO.getEvent().getSeatingMapImage() != null) {
            event.setSeatingMapImage(eventEditDTO.getEvent().getSeatingMapImage());
        }

        if (eventEditDTO.getEvent().getSeatingMapImageVersions() != null) {
            event.getSeatingMapImageVersions().clear();
            event.getSeatingMapImageVersions().addAll(eventEditDTO.getEvent().getSeatingMapImageVersions());
        }
        // Xử lý vé
        List<TicketDTO> ticketDTOs = eventEditDTO.getTicket();
        if (ticketDTOs != null) {
            for (TicketDTO ticketDTO : ticketDTOs) {
                // Kiểm tra ticketId để phân biệt vé mới và vé hiện có
                if (ticketDTO.getTicketId() == null) {
                    // Thêm vé mới
                    ticketService.addTicket(eventId, ticketDTO);
                } else {
                    // Cập nhật vé hiện có
                    ticketService.saveEditTicket(eventId, ticketDTO);
                }
            }
        }

        // Xử lý seatingLayout
        if (eventEditDTO.getEvent().getSeatingLayout() != null) {
            String seatingLayoutJson = eventEditDTO.getEvent().getSeatingLayout();
            ObjectMapper mapper = new ObjectMapper();
            JsonNode seatingLayoutNode = mapper.readTree(seatingLayoutJson);
            JsonNode seatingAreasNode = seatingLayoutNode.get("seatingAreas");

            Map<String, Integer> newTicketIds = new HashMap<>();
            if (ticketDTOs != null) {
                for (TicketDTO ticketDTO : ticketDTOs) {
                    if (ticketDTO.getTicketId() == null) {
                        Optional<Ticket> existingTicket = ticketRepository.findByEventIdAndTicketNameAndTicketTypeAndPriceAndQuantityAndStartTimeAndEndTime(
                                eventId,
                                ticketDTO.getTicketName(),
                                ticketDTO.getTicketType(),
                                ticketDTO.getPrice(),
                                ticketDTO.getQuantity(),
                                ticketDTO.getStartTime(),
                                ticketDTO.getEndTime()
                        );
                        if (existingTicket.isPresent()) {
                            newTicketIds.put(ticketDTO.getTicketName(), existingTicket.get().getTicketId());
                        } else {
                            Ticket ticket = new Ticket();
                            ticket.setTicketName(ticketDTO.getTicketName());
                            ticket.setTicketType(ticketDTO.getTicketType());
                            ticket.setPrice(ticketDTO.getPrice());
                            ticket.setQuantity(ticketDTO.getQuantity());
                            ticket.setStartTime(ticketDTO.getStartTime());
                            ticket.setEndTime(ticketDTO.getEndTime());
                            ticket.setSold(ticketDTO.getSold() != 0 ? ticketDTO.getSold() : 0);
                            ticket.setEvent(event);
                            ticket = ticketRepository.save(ticket);
                            newTicketIds.put(ticketDTO.getTicketName(), ticket.getTicketId());
                        }
                    } else {
                        newTicketIds.put(ticketDTO.getTicketName(), ticketDTO.getTicketId());
                    }
                }
            }

            if (seatingAreasNode.isArray()) {
                List<JsonNode> updatedAreas = new ArrayList<>();
                for (JsonNode areaNode : seatingAreasNode) {
                    ObjectNode updatedArea = areaNode.deepCopy();
                    String ticketIdStr = areaNode.has("ticketId") && !areaNode.get("ticketId").isNull()
                            ? areaNode.get("ticketId").asText()
                            : null;
                    Integer ticketId = null;
                    if (ticketIdStr != null) {
                        if (ticketIdStr.startsWith("ticket-new-")) {
                            String areaId = ticketIdStr.replace("ticket-new-", "");
                            String ticketName = areaNode.get("name").asText();
                            ticketId = newTicketIds.get(ticketName);
                        } else if (ticketIdStr.startsWith("ticket-")) {
                            ticketId = Integer.parseInt(ticketIdStr.replace("ticket-", ""));
                        }
                    }
                    if (ticketId != null) {
                        Optional<Ticket> ticket = ticketRepository.findById(ticketId);
                        if (!ticket.isPresent()) {
                            logger.error("Invalid ticketId {} in seating layout", ticketId);
                            throw new IllegalArgumentException("Invalid ticketId in seating layout: " + ticketId);
                        }
                        updatedArea.put("ticketId", "ticket-" + ticketId);
                    } else {
                        updatedArea.putNull("ticketId");
                    }
                    updatedAreas.add(updatedArea);
                }
                ((ObjectNode) seatingLayoutNode).set("seatingAreas", mapper.valueToTree(updatedAreas));
                seatingLayoutJson = mapper.writeValueAsString(seatingLayoutNode);
            }
            event.setSeatingLayout(seatingLayoutJson);
        }
        List<SegmentDTO> segmentDTOs = eventEditDTO.getSegment();
        if (segmentDTOs != null) {
            for (SegmentDTO segmentDTO : segmentDTOs) {
                if (segmentDTO.getSegmentId() == 0) {
                    segmentService.addSegment(eventId, segmentDTO);
                } else {
                    segmentService.saveEditSegment(eventId, segmentDTO);
                }
            }
        }

        eventRepository.save(event);
        logger.info("Event {} edited successfully", event.getEventName());
        return getEventAfterEdit(eventId);
    }

    @Override
    public void deleteEvent(int eventId) {
        Optional<Event> event = eventRepository.findById(eventId);
        if (event.isEmpty()) {
            throw new RuntimeException("Event not found with id " + eventId);
        }
        segmentService.deleteSegmentByEventId(eventId);
        ticketService.deleteTicketByEventId(eventId);
        eventRepository.delete(event.get());
    }

    @Override
    public List<EventDTO> findEventsByName(String eventName) {
        updateEventStatus();
        List<Event> events = eventRepository.findByEventNameContainingIgnoreCase(eventName);
        List<EventDTO> eventDTOs = events.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return sortEventsByStartTime(eventDTOs);
    }

    @Override
    public List<EventDTO> findEventsStatus(String eventStatus) {
        updateEventStatus();
        List<Event> events = eventRepository.findByEventStatusIgnoreCase(eventStatus);
        List<EventDTO> eventDTOs = events.stream()
               // .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return sortEventsByStartTime(eventDTOs);
    }

    @Override
    public List<EventDTO> findEventsByDate(LocalDateTime eventStart) {
        updateEventStatus();
        List<Event> events = eventRepository.findByEventStart(eventStart);
        List<EventDTO> eventDTOs = events.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return sortEventsByStartTime(eventDTOs);
    }

    @Override
    public List<EventDTO> findEventsByHost(String eventHost) {
        updateEventStatus();
        List<Event> events = eventRepository.findByEventHostContainingIgnoreCase(eventHost);
        List<EventDTO> eventDTOs = events.stream()
                .filter(event ->  !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return sortEventsByStartTime(eventDTOs);
    }

    @Override
    public List<EventDTO> findEventsByLocation(String eventLocation) {
        updateEventStatus();
        List<Event> events = eventRepository.findByEventLocationCityContainingIgnoreCase(eventLocation);
        List<EventDTO> eventDTOs = events.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return sortEventsByStartTime(eventDTOs);
    }

    @Override
    public List<EventDTO> findEventsByTags(String tag) {
        updateEventStatus();
        List<Event> events = eventRepository.findByTagsContainingIgnoreCase(tag);
        List<EventDTO> eventDTOs = events.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return sortEventsByStartTime(eventDTOs);
    }

    @Override
    public List<EventDTO> findEventsByType(String eventType) {
        updateEventStatus();
        EventType type = eventTypeRepository.findByTypeName(eventType);
        if (type == null) {
            logger.warn("Event type {} not found", eventType);
            return new ArrayList<>();
        }
        List<Event> events = eventRepository.findByEventType(type);
        List<EventDTO> eventDTOs = events.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return sortEventsByStartTime(eventDTOs);
    }

    @Override
    public List<EventDTO> findEventsByCurrentWeek() {
        updateEventStatus();
        List<Event> events = eventRepository.findEventsByCurrentWeek();
        List<EventDTO> eventDTOs = events.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return sortEventsByStartTime(eventDTOs);
    }

    @Override
    public List<EventDTO> findEventsByCurrentMonth() {
        updateEventStatus();
        List<Event> events = eventRepository.findEventsByCurrentMonth();
        List<EventDTO> eventDTOs = events.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return sortEventsByStartTime(eventDTOs);
    }

    @Override
    public List<EventDTO> findEventsByTicketType(String type) {
        updateEventStatus();
        List<Event> events = eventRepository.findEventsByTicketType(type);
        List<EventDTO> eventDTOs = events.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return sortEventsByStartTime(eventDTOs);
    }

    @Override
    public List<EventDTO> searchEventsByMultipleFilters(String eventCategory, String eventLocation, String eventStart, String ticketType) {
        updateEventStatus();
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
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return sortEventsByStartTime(eventDTOs);
    }

    @Override
    public List<EventDTO> findEventsByNameAndLocation(String name, String location) {
        updateEventStatus();
        List<Event> eventsByLocation = eventRepository.findByEventLocationCityContainingIgnoreCase(location);
        List<Event> filteredEvents = eventsByLocation.stream()
                .filter(event -> event.getEventName() != null &&
                        event.getEventName().toLowerCase().contains(name.toLowerCase()) &&
                        !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .collect(Collectors.toList());
        List<EventDTO> eventDTOs = filteredEvents.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return sortEventsByStartTime(eventDTOs);
    }

    private List<SegmentDTO> getAllSegments(int eventId) {
        List<Segment> list = segmentRepository.findByEventId(eventId);
        List<SegmentDTO> dtos = new ArrayList<>();
        for (Segment segment : list) {
            SegmentDTO dto = new SegmentDTO();
            if (segment.getSpeaker() != null) {
                Speaker speaker = segment.getSpeaker();
                SpeakerDTO speakerDTO = new SpeakerDTO();
                BeanUtils.copyProperties(speaker, speakerDTO);
                String urlImage = cloudinary.url().generate(speaker.getSpeakerImage());
                speakerDTO.setSpeakerImage(urlImage);
                dto.setSpeaker(speakerDTO);
            }
            BeanUtils.copyProperties(segment, dto);
            dto.setEventID(eventId);
            dto.setStartTime(segment.getStartTime());
            dto.setEndTime(segment.getEndTime());
            dto.setSegmentId(segment.getSegmentId());
            dtos.add(dto);
        }
        return dtos;
    }

    @Override
    public List<EventDTO> searchEventsByNameAndCity(String searchTerm, String cityKey) {
        updateEventStatus();
        List<Event> filteredEvents = new ArrayList<>();
        if ("all-locations".equals(cityKey)) {
            filteredEvents = eventRepository.findByEventNameContainingIgnoreCase(searchTerm);
        } else {
            filteredEvents = eventRepository
                    .findByEventNameContainingIgnoreCaseAndEventLocationCityContainingIgnoreCase(searchTerm, cityKey);
        }
        List<EventDTO> eventDTOs = filteredEvents.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return sortEventsByStartTime(eventDTOs);
    }

    @Transactional
    @Override
    public ResponseEntity<Response> saveEventToDB(EventDTO eventDTO) {
        String name = eventDTO.getEventHost();
        Optional<User> userOpt = userRepository.findByOrganizerName(name);
        if (!userOpt.isPresent()) {
            logger.error("User with organizerName {} not found", name);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new Response(404, "Not Found", "User not found"));
        }
        User user = userOpt.get();

        if (eventDTO.getEventStart().isAfter(eventDTO.getEventEnd())) {
            logger.error("Event start time {} is after end time {}", eventDTO.getEventStart(), eventDTO.getEventEnd());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new Response(400, "Bad Request", "Event start time must be before end time"));
        }

        Event event = new Event();
        BeanUtils.copyProperties(eventDTO, event, "eventLocation", "eventImages", "mediaContent", "eventTypeId");
        event.setEventHost(name);
        event.setUser(user);
        // Gán trạng thái mặc định là "Draft" nếu không được chỉ định
        event.setEventStatus(eventDTO.getEventStatus() != null ? eventDTO.getEventStatus() : "Draft");

        EventType eventType = eventTypeRepository.findById(eventDTO.getEventTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid event type ID: " + eventDTO.getEventTypeId()));
        event.setEventType(eventType);

        EventLocation eventLocation = new EventLocation();
        EventLocationDTO locationDTO = eventDTO.getEventLocation();
        if (locationDTO != null) {
            BeanUtils.copyProperties(locationDTO, eventLocation);
            event.setEventLocation(eventLocation);
        }

        if (eventDTO.getEventImages() != null) {
            event.setEventImages(new ArrayList<>(eventDTO.getEventImages()));
        }
        if (eventDTO.getMediaContent() != null) {
            event.setMediaContent(new ArrayList<>(eventDTO.getMediaContent()));
        }
        if (eventDTO.getSeatingMapImage() != null) {
            event.setSeatingMapImage(eventDTO.getSeatingMapImage());
        }
        if (eventDTO.getSeatingLayout() != null) {
            event.setSeatingLayout(eventDTO.getSeatingLayout());
        }
        if (eventDTO.getSeatingMapImageVersions() != null) {
            event.setSeatingMapImageVersions(new ArrayList<>(eventDTO.getSeatingMapImageVersions()));
        }
        Event tmp = eventRepository.save(event);
        logger.info("Event {} created successfully by user {} with status {}", event.getEventName(), name, event.getEventStatus());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new Response(201, "Success", convertToDTO(tmp)));
    }

    @Override
    public List<EventDTO> getAllEventByHost(String email) {
        updateEventStatus();
        Optional<User> host = userRepository.findByEmail(email);
        if (!host.isPresent()) {
            logger.error("User with email {} not found", email);
            return new ArrayList<>();
        }
        User organizer = host.get();
        if (organizer.getOrganizer() == null) {
            logger.error("User is not organizer");
            return new ArrayList<>();
        }
        List<Event> events = eventRepository.findByEventHost(organizer.getOrganizer().getOrganizerName());
        List<EventDTO> eventDTOs = events.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return sortEventsByStartTime(eventDTOs);
    }

    @Override
    public List<Event> findByUserUserId(int userId) {
        return eventRepository.findByUserUserId(userId);
    }
    @Override
    public List<Event> findByUserUserIdAndYear(int userId, int year) {
        return eventRepository.findByUserUserIdAndYear(userId, year);
    }

    @Override
    public List<EventDTO> topEventsByTicketsSold() {
        updateEventStatus();
        Pageable pageable = PageRequest.of(0, 10);
        List<Event> topEvents = eventRepository.findTopEventsByTicketsSold("PAID", "SUCCESSFULLY", pageable);
        List<EventDTO> topEventDTO = topEvents.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return sortEventsByStartTime(topEventDTO);
    }

    @Override
    public List<EventDTO> top10FavoriteEvents() {
        updateEventStatus();
        Pageable pageable = PageRequest.of(0, 10);
        List<Event> topEvents = eventRepository.findTop10FavoriteEvents(pageable);
        List<EventDTO> topEventDTO = topEvents.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return sortEventsByStartTime(topEventDTO);
    }

    @Override
    public List<String> top10Cities() {

        Pageable pageable = PageRequest.of(0, 10);
        List<String> top10Cities = eventRepository.findTop10CitiesByEventCount(pageable);
        List<String> topCity = new ArrayList<>();
        for (String city : top10Cities) {
            String cityName = cityMap.get(city);
            topCity.add(cityName);
        }
        return topCity;
    }

    @Override
    public List<EventDTO> getEventsByUSer(int userId) {
        updateEventStatus();
        User organizer = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        List<Event> eventDB = eventRepository.findByUser(organizer);
        List<EventDTO> eventDTOList = eventDB.stream()

                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return sortEventsByStartTime(eventDTOList);
    }

    @Override
    public Response deleteEventAndRefunds(HttpServletRequest request, int eventId) throws Exception {
        Optional<Event> event = eventRepository.findById(eventId);
        if (event.isPresent()) {
            if ("Complete".equals(event.get().getEventStatus())) {
                Response response = new Response(404, "Failed", "Can not delete the events that have been completed");
                return response;
            }
        }
        // Xóa bản ghi trong event_views
        List<EventView> eventView = eventViewRepository.getEventView(eventId);
        for (EventView e : eventView){
            eventViewRepository.delete(e);
        }
        List<Transaction> transactions = transactionRepository.transactions(eventId);
        if (!transactions.isEmpty()) {
            for (Transaction transaction : transactions) {
                TransactionDTO transactionDTO = new TransactionDTO();
                BeanUtils.copyProperties(transaction, transactionDTO);
                vnpayService.refund(request, transaction);
            }
        }

        eventRepository.deleteById(eventId);
        Response response = new Response(200, "Success", "Event deleted successfully");
        return response;
    }

    @Override
    public Set<EventDTO> findEventsByPreferredEventTypes(String email) {
        updateEventStatus();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            logger.error("User with email {} not found", email);
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

        Set<EventDTO> eventDTOS = matchedEvents.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(this::convertToDTO)
                .collect(Collectors.toSet());
        List<EventDTO> sortedEventDTOs = sortEventsByStartTime(new ArrayList<>(eventDTOS));
        return new HashSet<>(sortedEventDTOs);
    }

    @Override
    public Set<EventDTO> findEventsByPreferredTags(String email) {
        updateEventStatus();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            logger.error("User with email {} not found", email);
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

        Set<EventDTO> eventDTOS = matchedEvents.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(this::convertToDTO)
                .collect(Collectors.toSet());
        List<EventDTO> sortedEventDTOs = sortEventsByStartTime(new ArrayList<>(eventDTOS));
        return new HashSet<>(sortedEventDTOs);
    }

    @Override
    public List<EventDTO> findEventsByPreferredTypesAndTags(String email) {
        updateEventStatus();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            logger.error("User with email {} not found", email);
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
                    if (!matchedEvents.stream().anyMatch(e -> e.getEventID() == event.getEventID())) {
                        matchedEvents.add(event);
                    }
                }
            }
        }

        for (String tag : preferredTags) {
            List<Event> events = eventRepository.findByTagsContainingIgnoreCase(tag);
            for (Event event : events) {
                if (!matchedEvents.stream().anyMatch(e -> e.getEventID() == event.getEventID())) {
                    matchedEvents.add(event);
                }
            }
        }

        List<EventDTO> eventDTOs = matchedEvents.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return sortEventsByStartTime(eventDTOs);
    }

    public String[] splitByPipe(String input) {
        if (input == null || input.trim().isEmpty()) {
            return new String[0];
        }
        return Arrays.stream(input.split("\\|"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);
    }

    @Override
    public List<String> getAllTags() {
        Map<String, Integer> tagFrequency = new HashMap<>();
        List<Event> events = eventRepository.findAll();

        for (Event event : events) {
            EventDTO eventDTO = convertToDTO(event);
            String tags = eventDTO.getTags();
            if (tags != null && !tags.trim().isEmpty()) {
                String[] tagArray = splitByPipe(tags);
                for (String tag : tagArray) {
                    tagFrequency.put(tag, tagFrequency.getOrDefault(tag, 0) + 1);
                }
            }
        }

        List<Map.Entry<String, Integer>> tagList = new ArrayList<>(tagFrequency.entrySet());
        for (int i = 0; i < tagList.size(); i++) {
            for (int j = i + 1; j < tagList.size(); j++) {
                Map.Entry<String, Integer> entry1 = tagList.get(i);
                Map.Entry<String, Integer> entry2 = tagList.get(j);
                int freqCompare = entry2.getValue().compareTo(entry1.getValue());
                if (freqCompare == 0) {
                    freqCompare = entry1.getKey().compareTo(entry2.getKey());
                }
                if (freqCompare > 0) {
                    tagList.set(i, entry2);
                    tagList.set(j, entry1);
                }
            }
        }

        List<String> topTags = new ArrayList<>();
        for (int i = 0; i < Math.min(10, tagList.size()); i++) {
            topTags.add(tagList.get(i).getKey());
        }
        return topTags;
    }


    @Override
    public void recordEventView(Integer eventId, Integer userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event with ID " + eventId + " not found"));

        // Kiểm tra xem người dùng đã xem sự kiện trong 24 giờ qua chưa (tùy chọn)
        if (userId != null) {
            LocalDateTime threshold = LocalDateTime.now().minusHours(24);
            long recentViews = eventViewRepository.countRecentViewsByUser(eventId, userId, threshold);
            if (recentViews > 0) {
                logger.info("User {} already viewed event {} recently, skipping record", userId, eventId);
                return;
            }
        }

        EventView eventView = new EventView();
        eventView.setEvent(event);
        if (userId != null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User with ID " + userId + " not found"));
            eventView.setUser(user);
        }
        eventView.setViewTimestamp(LocalDateTime.now());
        eventViewRepository.save(eventView);
        logger.info("Recorded view for event {} by user {}", eventId, userId != null ? userId : "anonymous");
    }


    @Override
    public List<EventViewDTO> getTopViewedEvents(int limit) {
        updateEventStatus();
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
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }
    @Override
    public Response publishEvent(int eventId){
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id " + eventId));
        if (!"Draft".equals(event.getEventStatus())) {
            return new Response(400, "Bad Request", "Only Draft events can be published");
        }
        event.setEventStatus("public");
        event.setPublishTime(LocalDateTime.now());
        eventRepository.save(event);

        return new Response(200, "Success", convertToDTO(event));
    }

    @Override
    public Response reportEvent(int eventId, String reason) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id " + eventId));
        if ("Report".equals(event.getEventStatus())) {
            return new Response(400, "Bad Request", "Event is already reported");
        }
        if ("Complete".equals(event.getEventStatus())) {
            return new Response(400, "Bad Request", "Cannot report a completed event");
        }
        event.setEventStatus("Report");
        eventRepository.save(event);
        logger.info("Event {} reported with reason: {}", event.getEventName(), reason);

        // Gửi thông báo cho người tổ chức
        NotificationDTO notificationDTO = new NotificationDTO();
        notificationDTO.setTitle("Sự kiện bị báo cáo");
        notificationDTO.setMessage("Sự kiện " + event.getEventName() + " đã bị báo cáo vì lý do: " + reason);
        notificationDTO.setUserId(event.getUser().getUserId());
        notificationDTO.setRead(false);
        notificationDTO.setCreatedAt(new Date());
        notificationService.createNotification(notificationDTO);

        return new Response(200, "Success", "Event reported successfully");
    }
    @Override
    public Response reopenEvent(int eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id " + eventId));

        if (!"Report".equals(event.getEventStatus())) {
            return new Response(400, "Bad Request", "Only reported events can be reopened");
        }

        LocalDateTime now = LocalDateTime.now();
        if (event.getEventEnd().isBefore(now)) {
            // Sự kiện đã kết thúc
            event.setEventStatus("Complete");
            logger.info("Event {} reopened and set to Complete as it has ended", event.getEventName());
        } else if (event.getEventStart().isAfter(now)) {
            // Sự kiện chưa diễn ra
            event.setEventStatus("public");
            event.setPublishTime(LocalDateTime.now());
            logger.info("Event {} reopened and set to public as it has not started", event.getEventName());
        } else {
            // Sự kiện đang diễn ra
            event.setEventStatus("public");
            logger.info("Event {} reopened and set to public as it is ongoing", event.getEventName());
        }

        eventRepository.save(event);

        // Gửi thông báo cho người tổ chức
        NotificationDTO notificationDTO = new NotificationDTO();
        notificationDTO.setTitle("Sự kiện được mở lại");
        notificationDTO.setMessage("Sự kiện " + event.getEventName() + " đã được mở lại với trạng thái " + event.getEventStatus());
        notificationDTO.setUserId(event.getUser().getUserId());
        notificationDTO.setRead(false);
        notificationDTO.setCreatedAt(new Date());
        notificationService.createNotification(notificationDTO);

        return new Response(200, "Success", convertToDTO(event));
    }



    @Override
    public String getEventViewsAsCSV() {
        try {
            List<EventView> views = eventViewRepository.findAll();
            List<Booking> bookings = bookingRepository.findAll();
            Map<String, Integer> ratings = new HashMap<>();

            // Lượt xem
            for (EventView view : views) {
                String key = view.getUser().getUserId() + "_" + view.getEvent().getEventID();
                ratings.merge(key, 1, Integer::sum);
            }

            // Mua vé
            for (Booking booking : bookings) {
                String key = booking.getUser().getUserId() + "_" + booking.getEvent().getEventID();
                ratings.merge(key, 5, Integer::sum);
            }

            StringBuilder csvContent = new StringBuilder("userId,eventId,rating\n");
            for (Map.Entry<String, Integer> entry : ratings.entrySet()) {
                String[] parts = entry.getKey().split("_");
                csvContent.append(String.format("%s,%s,%d\n", parts[0], parts[1], entry.getValue()));
            }

            logger.info("Generated CSV content with {} records", ratings.size());
            return csvContent.toString();
        } catch (Exception e) {
            logger.error("Error generating CSV content", e);
            throw new RuntimeException("Failed to generate event views CSV", e);
        }
    }
}