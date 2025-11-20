package hcmute.fit.event_management.controller.organizer;

import hcmute.fit.event_management.dto.SegmentDTO;
import hcmute.fit.event_management.service.SegmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/segment")
public class SegmentController {

    private final SegmentService segmentService;

    public SegmentController(SegmentService segmentService) {
        this.segmentService = segmentService;
    }

    @GetMapping("detail/{eventId}")
    public ResponseEntity<List<SegmentDTO>> getSegmentByEventId(@PathVariable("eventId") int eventId) {
        List<SegmentDTO> list = segmentService.getAllSegments(eventId);
        return ResponseEntity.ok(list);
    }
    @PostMapping("/{eventId}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<SegmentDTO> createSegment(@PathVariable("eventId") int eventId, @RequestBody SegmentDTO segmentDTO) throws Exception {
        segmentService.addSegment(eventId, segmentDTO);
        return ResponseEntity.ok(segmentDTO);
    }
    @DeleteMapping("/delete/{segmentId}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<Boolean> deleteSegment(@PathVariable("segmentId") int segmentId) {
        segmentService.deleteById(segmentId);
        return ResponseEntity.ok(true);
    }
}



