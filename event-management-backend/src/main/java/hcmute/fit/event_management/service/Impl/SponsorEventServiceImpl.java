package hcmute.fit.event_management.service.Impl;

import hcmute.fit.event_management.entity.Sponsor;
import hcmute.fit.event_management.entity.SponsorEvent;
import hcmute.fit.event_management.entity.keys.SponsorEventId;
import hcmute.fit.event_management.repository.SponsorEventRepository;
import hcmute.fit.event_management.service.ISponsorEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SponsorEventServiceImpl implements ISponsorEventService {
    @Autowired
    SponsorEventRepository sponsorEventRepository;

    @Override
    public List<SponsorEvent> findByEventId(int eventId) {
        return sponsorEventRepository.findByEventId(eventId);
    }

    @Override
    public void deleteById(SponsorEventId sponsorEventId) {
        sponsorEventRepository.deleteById(sponsorEventId);
    }

    @Override
    public <S extends SponsorEvent> S save(S entity) {
        return sponsorEventRepository.save(entity);
    }
    @Override
    public Optional<SponsorEvent> findById(SponsorEventId sponsorEventId) {
        return sponsorEventRepository.findById(sponsorEventId);
    }
    @Override
    public Boolean existsByIdEventIdAndIdSponsorId(int eventId, int sponsorId){
        return sponsorEventRepository.existsByIdEventIdAndIdSponsorId(eventId,sponsorId);
    }
    @Override
    public <S extends SponsorEvent> List<S> saveAll(Iterable<S> entities) {
        return sponsorEventRepository.saveAll(entities);
    }

    @Override
    public long countSponsorsByOrganizer(int userId) {
        return sponsorEventRepository.countSponsorsByOrganizer(userId);
    }
    @Override
    public List<Sponsor> findDistinctSponsorsByEventUserUserId(int eventId) {
        return sponsorEventRepository.findDistinctSponsorsByEventUserUserId(eventId);
    }
    @Override
    public Page<SponsorEvent> findByEventId(int eventId, Pageable pageable) {
        return sponsorEventRepository.findByEventId(eventId, pageable);
    }
    @Override
    public Page<SponsorEvent> findByEventIdWithFilters(int eventId, String search, String level, Pageable pageable) {
        return sponsorEventRepository.findByEventIdWithFilters(eventId, search, level, pageable);
    }
    @Override
    public long countSponsorsByOrganizerAndYear(int userId, int year) {
        return sponsorEventRepository.countSponsorsByOrganizerAndYear(userId, year);
    }
}
