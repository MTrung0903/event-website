package hcmute.fit.event_management.service.Impl;

import com.cloudinary.Cloudinary;
import hcmute.fit.event_management.dto.SegmentDTO;
import hcmute.fit.event_management.dto.SpeakerDTO;
import hcmute.fit.event_management.entity.Segment;
import hcmute.fit.event_management.entity.Speaker;
import hcmute.fit.event_management.repository.EventRepository;
import hcmute.fit.event_management.repository.SegmentRepository;
import hcmute.fit.event_management.service.ISegmentService;
import hcmute.fit.event_management.service.ISpeakerService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class SegmentServiceImpl implements ISegmentService {
    @Autowired
    private SegmentRepository segmentRepository;
    @Autowired
    private EventRepository eventRepository;
    @Autowired
    private ISpeakerService speakerService;
    @Autowired
    private Cloudinary cloudinary;

    public SegmentServiceImpl(SegmentRepository segmentRepository) {
        this.segmentRepository = segmentRepository;
    }

    @Override
    public void addSegment(int eventId, SegmentDTO segmentDTO) throws Exception {
        Segment newSegment = new Segment();
        BeanUtils.copyProperties(segmentDTO, newSegment);
        newSegment.setEvent(eventRepository.findById(eventId).orElseThrow(
                () -> new Exception("Not found event by eventId " + eventId)));

        if (segmentDTO.getSpeaker() != null) {
            SpeakerDTO speakerDTO = segmentDTO.getSpeaker();
            Speaker speaker = speakerService.addSpeaker(speakerDTO);
            newSegment.setSpeaker(speaker);
        }

        segmentRepository.save(newSegment);
    }

    @Override
    public List<SegmentDTO> getAllSegments(int eventId) {
        List<Segment> list = segmentRepository.findByEventId(eventId);
        List<SegmentDTO> dtos = new ArrayList<>();
        for (Segment segment : list) {
            SegmentDTO dto = new SegmentDTO();
            if(segment.getSpeaker() != null) {
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

    @Override
    public void deleteById(Integer segmentId) {
        segmentRepository.deleteById(segmentId);
    }

    @Override
    public void saveEditSegment(int eventId, SegmentDTO segmentDTO) throws Exception {
        Optional<Segment> existingSegmentOpt = segmentRepository.findById(segmentDTO.getSegmentId());
        Segment segment;

        if (existingSegmentOpt.isPresent()) {
            // Update existing segment
            segment = existingSegmentOpt.get();
            BeanUtils.copyProperties(segmentDTO, segment, "speaker", "event");
        } else {
            // Create new segment
            segment = new Segment();
            BeanUtils.copyProperties(segmentDTO, segment);
            segment.setEvent(eventRepository.findById(eventId).orElseThrow(
                    () -> new Exception("Not found event by eventId " + eventId)));
        }

        if (segmentDTO.getSpeaker() != null) {
            SpeakerDTO speakerDTO = segmentDTO.getSpeaker();
            Speaker speaker;
            if (speakerDTO.getSpeakerId() != 0) {
                speaker = speakerService.saveSpeakerEdit(speakerDTO);
            } else {
                speaker = speakerService.addSpeaker(speakerDTO);
            }
            segment.setSpeaker(speaker);
        } else {
            segment.setSpeaker(null);
        }

        segmentRepository.save(segment);
    }

    @Override
    public void deleteSegmentByEventId(int eventId) {
        List<Segment> list = segmentRepository.findByEventId(eventId);
        if (!list.isEmpty()) {
            for (Segment segment : list) {
                if (segment.getSpeaker() != null) {
                    speakerService.deleteById(segment.getSpeaker().getSpeakerId());
                }
                segmentRepository.delete(segment);
            }
        }
    }

    @Override
    public List<Speaker> getSpeakerByEventId(int eventId) {
        return segmentRepository.getSpeakerByEventId(eventId);
    }
}