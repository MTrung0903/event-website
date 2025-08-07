package hcmute.fit.event_management.controller.manager;

import hcmute.fit.event_management.dto.SegmentDTO;
import hcmute.fit.event_management.service.ISegmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/segment")
public class SegmentController {
    @Autowired
    private ISegmentService segmentService;

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



