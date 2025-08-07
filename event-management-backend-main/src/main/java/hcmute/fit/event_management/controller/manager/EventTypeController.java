package hcmute.fit.event_management.controller.manager;

import hcmute.fit.event_management.dto.EventTypeDTO;
import hcmute.fit.event_management.service.IEventTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import payload.Response;

import java.util.List;

@RestController
@RequestMapping("/api/events-type")
public class EventTypeController {

    @Autowired
    private  IEventTypeService eventTypeService;



    @GetMapping("/get-all-event-types")
    public ResponseEntity<List<EventTypeDTO>> getAllEventTypes() {
        List<EventTypeDTO> eventTypes = eventTypeService.getAllEventTypes();
        return ResponseEntity.ok(eventTypes);
    }

    @PostMapping("/create-types")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Response> createEventType(@RequestBody EventTypeDTO eventTypeDTO) {
       Response response = eventTypeService.createEventType(eventTypeDTO);
       return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Response> updateEventType(@PathVariable Long id, @RequestBody EventTypeDTO eventTypeDTO) {
        Response response =  eventTypeService.updateEventType(id, eventTypeDTO);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEventType(@PathVariable Long id) {
        eventTypeService.deleteEventType(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/search")
    public ResponseEntity<List<EventTypeDTO>> searchEventTypes(@RequestParam String typeName) {
        List<EventTypeDTO> eventTypes = eventTypeService.searchEventTypes(typeName);
        return ResponseEntity.ok(eventTypes);
    }
}
