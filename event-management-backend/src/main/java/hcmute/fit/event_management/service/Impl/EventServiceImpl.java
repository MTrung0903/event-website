package hcmute.fit.event_management.service.Impl;

import com.cloudinary.Cloudinary;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import hcmute.fit.event_management.dto.*;
import hcmute.fit.event_management.entity.*;
import hcmute.fit.event_management.mapper.EventMapper;
import hcmute.fit.event_management.repository.*;
import hcmute.fit.event_management.service.EventService;
import hcmute.fit.event_management.service.NotificationService;
import hcmute.fit.event_management.service.SegmentService;
import hcmute.fit.event_management.service.TicketService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.springframework.beans.BeanUtils;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import payload.Response;


import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;

    private final EventTypeRepository eventTypeRepository;

    private final Cloudinary cloudinary;

    private final TicketRepository ticketRepository;

    private final SegmentRepository segmentRepository;

    private final SegmentService segmentService;

    private final TicketService ticketService;

    private final UserRepository userRepository;

    private final TransactionRepository transactionRepository;

    private final VNPAYService vnpayService;

    private final EventViewRepository eventViewRepository;


    private final BookingRepository bookingRepository;


    private final NotificationService notificationService;

    private final EventMapper eventMapper;

    public EventServiceImpl(BookingRepository bookingRepository, Cloudinary cloudinary,
                            EventRepository eventRepository, EventTypeRepository eventTypeRepository,
                            EventViewRepository eventViewRepository, NotificationService notificationService,
                            SegmentRepository segmentRepository, SegmentService segmentService,
                            TicketRepository ticketRepository, TicketService ticketService,
                            TransactionRepository transactionRepository, UserRepository userRepository,
                            VNPAYService vnpayService, EventMapper eventMapper) {
        this.bookingRepository = bookingRepository;
        this.cloudinary = cloudinary;
        this.eventRepository = eventRepository;
        this.eventTypeRepository = eventTypeRepository;
        this.eventViewRepository = eventViewRepository;

        this.notificationService = notificationService;
        this.segmentRepository = segmentRepository;
        this.segmentService = segmentService;
        this.ticketRepository = ticketRepository;
        this.ticketService = ticketService;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.vnpayService = vnpayService;
        this.eventMapper = eventMapper;
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
    public Optional<Event> findById(Integer eventId) {
        return eventRepository.findById(eventId);
    }

    @Override
    public EventDTO getEventById(int eventId) {
        Event event = findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));

        return eventMapper.toDto(event);
    }





    @Override
    public List<EventDTO> getAllEvent() {

        List<Event> events = eventRepository.findAll();
        List<EventDTO> eventDTOs = events.stream()
                .filter(event -> !"Complete".equals(event.getEventStatus()) && !"Report".equals(event.getEventStatus()) && !"Draft".equals(event.getEventStatus()))
                .map(eventMapper::toDto)
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

                            String ticketName = areaNode.get("name").asText();
                            ticketId = newTicketIds.get(ticketName);
                        } else if (ticketIdStr.startsWith("ticket-")) {
                            ticketId = Integer.parseInt(ticketIdStr.replace("ticket-", ""));
                        }
                    }
                    if (ticketId != null) {
                        Optional<Ticket> ticket = ticketRepository.findById(ticketId);
                        if (ticket.isEmpty()) {

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

        return getEventAfterEdit(eventId);
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


    @Transactional
    @Override
    public ResponseEntity<Response> saveEventToDB(EventDTO eventDTO) {
        String name = eventDTO.getEventHost();
        Optional<User> userOpt = userRepository.findByOrganizerName(name);
        if (userOpt.isEmpty()) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new Response(404, "Not Found", "User not found"));
        }
        User user = userOpt.get();

        if (eventDTO.getEventStart().isAfter(eventDTO.getEventEnd())) {

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

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new Response(201, "Success", eventMapper.toDto(tmp)));
    }


    @Override
    public Response deleteEventAndRefunds(HttpServletRequest request, int eventId) throws Exception {
        Optional<Event> event = eventRepository.findById(eventId);
        if (event.isPresent()) {
            if ("Complete".equals(event.get().getEventStatus())) {
                return new Response(404, "Failed", "Can not delete the events that have been completed");
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
        return new Response(200, "Success", "Event deleted successfully");
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
            EventDTO eventDTO = eventMapper.toDto(event);
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

        return new Response(200, "Success", eventMapper.toDto(event));
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

        } else if (event.getEventStart().isAfter(now)) {
            // Sự kiện chưa diễn ra
            event.setEventStatus("public");
            event.setPublishTime(LocalDateTime.now());

        } else {
            // Sự kiện đang diễn ra
            event.setEventStatus("public");

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

        return new Response(200, "Success", eventMapper.toDto(event));
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


            return csvContent.toString();
        } catch (Exception e) {

            throw new RuntimeException("Failed to generate event views CSV", e);
        }
    }
}