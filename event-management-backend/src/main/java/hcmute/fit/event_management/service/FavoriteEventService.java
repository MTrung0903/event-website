package hcmute.fit.event_management.service;

import hcmute.fit.event_management.dto.FavoriteEventDTO;

import java.util.List;

public interface FavoriteEventService {
    void saveFavoriteEvent(int userId, int eventId);

    void removeFavoriteEvent(int userId, int eventId);

    List<FavoriteEventDTO> getFavoriteEvents(int userId);
}
