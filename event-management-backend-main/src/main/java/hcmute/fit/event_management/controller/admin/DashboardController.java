package hcmute.fit.event_management.controller.admin;

import hcmute.fit.event_management.dto.DashboardStatsDTO;
import hcmute.fit.event_management.dto.EventDTO;
import hcmute.fit.event_management.service.Impl.AdminServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import payload.PageResponse;
import payload.Response;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/dashboard")

public class DashboardController {
    @Autowired
    AdminServiceImpl adminService;

    @GetMapping("/stats")
    public ResponseEntity<?> dashboard(
            @RequestParam(value = "year", required = false) Integer year) {

        DashboardStatsDTO stats = adminService.getDashboardStats(year);
        Response response = new Response(1, "SUCCESSFULLY", stats);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/events")
    public ResponseEntity<?> dashboard(
            @RequestParam(value = "search", defaultValue = "") String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "4") int size,
            @RequestParam(value = "sort", defaultValue = "") String sort) {
        PageResponse pageResponse = adminService.getEvents(search, page, size, sort);
        Response response = new Response(1, "", pageResponse);
        return ResponseEntity.ok(response);
    }
}
