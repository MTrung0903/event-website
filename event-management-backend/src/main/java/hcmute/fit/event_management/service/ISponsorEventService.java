package hcmute.fit.event_management.service;


import hcmute.fit.event_management.entity.Sponsor;
import hcmute.fit.event_management.entity.SponsorEvent;
import hcmute.fit.event_management.entity.keys.SponsorEventId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface ISponsorEventService {

    List<SponsorEvent> findByEventId(int eventId);

    void deleteById(SponsorEventId sponsorEventId);

    <S extends SponsorEvent> S save(S entity);

    Optional<SponsorEvent> findById(SponsorEventId sponsorEventId);

    Boolean existsByIdEventIdAndIdSponsorId(int eventId, int sponsorId);

    <S extends SponsorEvent> List<S> saveAll(Iterable<S> entities);

    long countSponsorsByOrganizer(int userId);

    List<Sponsor> findDistinctSponsorsByEventUserUserId(int eventId);

    Page<SponsorEvent> findByEventId(int eventId, Pageable pageable);
    Page<SponsorEvent> findByEventIdWithFilters(int eventId, String search, String level, Pageable pageable);

    long countSponsorsByOrganizerAndYear(int userId, int year);
}
