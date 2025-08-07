package hcmute.fit.event_management.service.Impl;

import hcmute.fit.event_management.dto.SpeakerDTO;
import hcmute.fit.event_management.entity.Speaker;
import hcmute.fit.event_management.repository.SpeakerRepository;
import hcmute.fit.event_management.service.ISpeakerService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SpeakerServiceImpl implements ISpeakerService {
    @Autowired
    private SpeakerRepository speakerRepository;


    public SpeakerServiceImpl(SpeakerRepository speakerRepository) {
        this.speakerRepository = speakerRepository;
    }

    @Override
    public Optional<Speaker> findById(Integer integer) {
        return speakerRepository.findById(integer);
    }

    @Override
    public void deleteById(Integer integer) {
        speakerRepository.deleteById(integer);
    }
    @Override
    public Speaker addSpeaker(SpeakerDTO speakerDTO) {
        Speaker speaker = new Speaker();
        BeanUtils.copyProperties(speakerDTO, speaker);

        return  speakerRepository.save(speaker);
    }
    @Override
    public <S extends Speaker> S save(S entity) {
        return speakerRepository.save(entity);
    }
    @Override
    public Page<Speaker> findAll(Pageable pageable) {
        return speakerRepository.findAll(pageable);
    }
    @Override
    public List<Speaker> findAll(Sort sort) {
        return speakerRepository.findAll(sort);
    }
    @Override
    public long count() {
        return speakerRepository.count();
    }
    @Override
    public Speaker saveSpeakerEdit(SpeakerDTO speakerDTO) {
        Speaker speaker = new Speaker();
        BeanUtils.copyProperties(speakerDTO, speaker);

        return speakerRepository.save(speaker);
    }
}
