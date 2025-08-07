package hcmute.fit.event_management.service.Impl;

import hcmute.fit.event_management.dto.SponsorEventDTO;
import hcmute.fit.event_management.entity.Sponsor;
import hcmute.fit.event_management.entity.SponsorEvent;
import hcmute.fit.event_management.repository.SponsorEventRepository;
import hcmute.fit.event_management.repository.SponsorRepository;
import hcmute.fit.event_management.service.ISponsorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SponsorServiceImpl implements ISponsorService {

    @Autowired
    SponsorRepository sponsorRepository;
    @Autowired
    SponsorEventRepository sponsorEventRepository;
    @Autowired
    CloudinaryService cloudinaryService;

    @Override
    public <S extends Sponsor> List<S> findAll(Example<S> example) {
        return sponsorRepository.findAll(example);
    }
    @Override
    public <S extends Sponsor> List<S> findAll(Example<S> example, Sort sort) {
        return sponsorRepository.findAll(example, sort);
    }
    @Override
    public List<Sponsor> findAll() {
        return sponsorRepository.findAll();
    }
    @Override
    public List<Sponsor> findAllById(Iterable<Integer> integers) {
        return sponsorRepository.findAllById(integers);
    }
    @Override
    public Optional<Sponsor> findById(Integer integer) {
        return sponsorRepository.findById(integer);
    }
    @Override
    public long count() {
        return sponsorRepository.count();
    }
    @Override
    public void deleteById(Integer integer) {
        sponsorRepository.deleteById(integer);
    }

    @Override
    public <S extends Sponsor> S save(S entity) {
        return sponsorRepository.save(entity);
    }

    @Override
    public List<Sponsor> findAll(Sort sort) {
        return sponsorRepository.findAll(sort);
    }
    @Override
    public Page<Sponsor> findAll(Pageable pageable) {
        return sponsorRepository.findAll(pageable);
    }
    @Override
    public Optional<Sponsor> findBySponsorEmailOrSponsorPhone(String email, String phone){
        return sponsorRepository.findBySponsorEmailOrSponsorPhone(email, phone);
    }

    @Override
    public List<SponsorEventDTO> getAllSponsorsInEvent(int eventId) {
        List<SponsorEvent> sponsorEvents = sponsorEventRepository.findByEventId(eventId);
        List<SponsorEventDTO> sponsorEventDTOs = new ArrayList<>();
        for (SponsorEvent sponsorEvent : sponsorEvents) {
            SponsorEventDTO sponsorEventDTO = new SponsorEventDTO();
            sponsorEventDTO.setSponsorId(sponsorEvent.getSponsor().getSponsorId());
            sponsorEventDTO.setSponsorName(sponsorEvent.getSponsor().getSponsorName());
            sponsorEventDTO.setSponsorEmail(sponsorEvent.getSponsor().getSponsorEmail());
            sponsorEventDTO.setSponsorAddress(sponsorEvent.getSponsor().getSponsorAddress());
            sponsorEventDTO.setSponsorLogo(cloudinaryService.getFileUrl(sponsorEvent.getSponsor().getSponsorLogo()));
            sponsorEventDTO.setSponsorPhone(sponsorEvent.getSponsor().getSponsorPhone());
            sponsorEventDTO.setSponsorWebsite(sponsorEvent.getSponsor().getSponsorWebsite());
            sponsorEventDTO.setSponsorRepresentativeName(sponsorEvent.getSponsor().getSponsorRepresentativeName());
            sponsorEventDTO.setSponsorRepresentativeEmail(sponsorEvent.getSponsor().getSponsorRepresentativeEmail());
            sponsorEventDTO.setSponsorRepresentativePhone(sponsorEvent.getSponsor().getSponsorRepresentativePhone());
            sponsorEventDTO.setSponsorRepresentativePosition(sponsorEvent.getSponsor().getSponsorRepresentativePosition());
            sponsorEventDTO.setSponsorType(sponsorEvent.getSponsorType());
            sponsorEventDTO.setSponsorLevel(sponsorEvent.getSponsorLevel());
            sponsorEventDTO.setSponsorStartDate(sponsorEvent.getSponsorStartDate());
            sponsorEventDTO.setSponsorEndDate(sponsorEvent.getSponsorEndDate());
            sponsorEventDTO.setSponsorStatus(sponsorEvent.getSponsorStatus());
            sponsorEventDTOs.add(sponsorEventDTO);
        }
        return sponsorEventDTOs;
    }
}
