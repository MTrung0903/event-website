package hcmute.fit.event_management.controller.manager;

import hcmute.fit.event_management.dto.SegmentDTO;
import hcmute.fit.event_management.dto.SpeakerDTO;
import hcmute.fit.event_management.entity.Speaker;
import hcmute.fit.event_management.entity.Segment;

import hcmute.fit.event_management.service.ISegmentService;
import hcmute.fit.event_management.service.ISpeakerService;
import hcmute.fit.event_management.service.Impl.CloudinaryService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import payload.Response;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class SpeakerController {
    @Autowired
    ISpeakerService speakerService;
    @Autowired
    ISegmentService segmentService;
    @Autowired
    CloudinaryService cloudinaryService;
    @GetMapping("/myevent/{eid}/speaker")
    public ResponseEntity<?> getSpeakersByEventId(@PathVariable("eid") int eid) {
        List<Speaker> speakers = segmentService.getSpeakerByEventId(eid);
        List<SpeakerDTO> speakerDTOS = new ArrayList<>();
        for (Speaker speaker : speakers) {
            SpeakerDTO speakerDTO = new SpeakerDTO();
            BeanUtils.copyProperties(speaker, speakerDTO);
            speakerDTO.setSpeakerImage(cloudinaryService.getFileUrl(speaker.getSpeakerImage()));
            speakerDTOS.add(speakerDTO);
        }
        Response response = new Response(200, "", speakerDTOS);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/myevent/{eid}/speaker")
    public ResponseEntity<?> createSpeakerByEventId(@PathVariable("eid") int eid, @ModelAttribute SegmentDTO segmentDTO, // Nhận toàn bộ dữ liệu dạng text
                                                    @RequestParam(value = "speakerImageFile", required = false) MultipartFile speakerImageFile)
            throws Exception {
        segmentService.addSegment(eid, segmentDTO);
        Response response = new Response(200, "", null);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    @PutMapping("/myevent/{eid}/speaker")
    public ResponseEntity<?> updateSpeakerByEventId(@PathVariable("eid") int eid, @ModelAttribute SegmentDTO segmentDTO, // Nhận toàn bộ dữ liệu dạng text
                                                    @RequestParam(value = "speakerImageFile", required = false) MultipartFile speakerImageFile)
            throws Exception {
        segmentService.saveEditSegment(eid, segmentDTO);
        Response response = new Response(200, "", null);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    @DeleteMapping("/speaker/{segmentId}")
    public ResponseEntity<?> deleteSpeakerByEventId(@PathVariable("segmentId") int segmentId) throws IOException {
        segmentService.deleteById(segmentId);
        Response response = new Response(200, "", null);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
