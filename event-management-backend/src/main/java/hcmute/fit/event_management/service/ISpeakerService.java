package hcmute.fit.event_management.service;

import hcmute.fit.event_management.dto.SpeakerDTO;
import hcmute.fit.event_management.entity.Speaker;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Optional;

public interface ISpeakerService {
    Optional<Speaker> findById(Integer integer);

    void deleteById(Integer integer);

    Speaker addSpeaker(SpeakerDTO speakerDTO);

    <S extends Speaker> S save(S entity);

    Page<Speaker> findAll(Pageable pageable);

    List<Speaker> findAll(Sort sort);

    long count();
    Speaker saveSpeakerEdit(SpeakerDTO speakerDTO);
}