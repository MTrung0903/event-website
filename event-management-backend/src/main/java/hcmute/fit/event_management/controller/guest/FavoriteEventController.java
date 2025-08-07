package hcmute.fit.event_management.controller.guest;

import hcmute.fit.event_management.dto.EventDTO;
import hcmute.fit.event_management.dto.FavoriteEventDTO;
import hcmute.fit.event_management.dto.NotificationDTO;
import hcmute.fit.event_management.entity.Event;
import hcmute.fit.event_management.repository.EventRepository;
import hcmute.fit.event_management.service.IEventService;
import hcmute.fit.event_management.service.IFavoriteEventService;
import hcmute.fit.event_management.service.INotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import payload.Response;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteEventController {
    @Autowired
    private SimpMessagingTemplate template;
    @Autowired
    private IFavoriteEventService favoriteEventService;

    @Autowired
    private EventRepository eventRepository;
    @Autowired
    private INotificationService notificationService;

    @Autowired
    private IEventService eventService;
    @PostMapping
    public ResponseEntity<Response> saveFavoriteEvent(@RequestBody FavoriteEventDTO favorite) {
        favoriteEventService.saveFavoriteEvent(favorite.getUserId(), favorite.getEventId());
        Optional<Event> event = eventRepository.findByEventID(favorite.getEventId());
        String eventName = event.get().getEventName();


        // Tạo và gửi thông báo cho người nhận
        NotificationDTO notificationDTO = new NotificationDTO();
        notificationDTO.setTitle("Notification");
        notificationDTO.setMessage("You have saved the " +eventName+" event on your favorite list");
        notificationDTO.setUserId(favorite.getUserId());
        notificationDTO.setRead(false);
        notificationDTO.setCreatedAt(new Date());
        notificationService.createNotification(notificationDTO);
        template.convertAndSendToUser(
                String.valueOf(notificationDTO.getUserId()),
                "/specific",
                notificationDTO
        );
        return ResponseEntity.ok(new Response(200,"Success", notificationDTO));
    }

    @DeleteMapping()
    public ResponseEntity<?> removeFavoriteEvent(@RequestBody FavoriteEventDTO request) {
        favoriteEventService.removeFavoriteEvent(request.getUserId(), request.getEventId());
        return ResponseEntity.ok(new Response(200,"Success", null));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<EventDTO>> getFavoriteEvents(@PathVariable int userId) {
        List<FavoriteEventDTO> favoriteEvents = favoriteEventService.getFavoriteEvents(userId);
        List<EventDTO> eventDTOS = new ArrayList<>();
        for (FavoriteEventDTO favoriteEvent : favoriteEvents) {
            EventDTO event = eventService.getEventById(favoriteEvent.getEventId());
            eventDTOS.add(event);
        }
        return ResponseEntity.ok(eventDTOS);
    }
}
