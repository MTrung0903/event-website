package hcmute.fit.event_management.service.Impl;

import hcmute.fit.event_management.dto.FavoriteEventDTO;
import hcmute.fit.event_management.entity.Event;
import hcmute.fit.event_management.entity.FavoriteEvent;
import hcmute.fit.event_management.entity.User;
import hcmute.fit.event_management.entity.keys.FavoriteEventId;
import hcmute.fit.event_management.repository.EventRepository;
import hcmute.fit.event_management.repository.FavoriteEventRepository;
import hcmute.fit.event_management.repository.UserRepository;
import hcmute.fit.event_management.service.FavoriteEventService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class FavoriteEventServiceImpl implements FavoriteEventService {

    private final FavoriteEventRepository favoriteEventRepository;


    private final UserRepository userRepository;


    private final EventRepository eventRepository;

    public FavoriteEventServiceImpl(EventRepository eventRepository,
                                    FavoriteEventRepository favoriteEventRepository,
                                    UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.favoriteEventRepository = favoriteEventRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void saveFavoriteEvent(int userId, int eventId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (favoriteEventRepository.existsByUserIdAndEventId(userId, eventId)) {
            throw new RuntimeException("Event already saved");
        }

        FavoriteEvent favoriteEvent = new FavoriteEvent();
        favoriteEvent.setId(new FavoriteEventId(userId, eventId));
        favoriteEvent.setUser(user);
        favoriteEvent.setEvent(event);
        favoriteEventRepository.save(favoriteEvent);
    }

    @Override
    public void removeFavoriteEvent(int userId, int eventId) {
        Optional<FavoriteEvent> event = favoriteEventRepository.findByUserIdAndEventId(userId, eventId);
        if (event.isEmpty()) {
            throw new RuntimeException("Event not found");
        }else{
            favoriteEventRepository.delete(event.get());
        }

    }

    @Override
    public List<FavoriteEventDTO> getFavoriteEvents(int userId) {
        List<FavoriteEvent> favoriteEvents = favoriteEventRepository.findByUserId(userId);
        List<FavoriteEventDTO> favoriteEventDTOS = new ArrayList<>();
        for (FavoriteEvent favoriteEvent : favoriteEvents) {
            FavoriteEventDTO favoriteEventDTO = new FavoriteEventDTO();
            favoriteEventDTO.setEventId(favoriteEvent.getEvent().getEventID());
            favoriteEventDTO.setUserId(favoriteEvent.getUser().getUserId());
            favoriteEventDTOS.add(favoriteEventDTO);
        }
        return favoriteEventDTOS;
    }
}
