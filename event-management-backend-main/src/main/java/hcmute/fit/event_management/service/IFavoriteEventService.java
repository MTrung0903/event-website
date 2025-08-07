package hcmute.fit.event_management.service;

import hcmute.fit.event_management.dto.FavoriteEventDTO;
import hcmute.fit.event_management.entity.Event;

import java.util.List;

public interface IFavoriteEventService {
    void saveFavoriteEvent(int userId, int eventId);

    void removeFavoriteEvent(int userId, int eventId);

    List<FavoriteEventDTO> getFavoriteEvents(int userId);
}
