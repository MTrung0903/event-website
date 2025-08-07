package hcmute.fit.event_management.controller.guest;

import hcmute.fit.event_management.dto.OrganizerDTO;
import hcmute.fit.event_management.dto.UserDTO;
import hcmute.fit.event_management.entity.Organizer;
import hcmute.fit.event_management.entity.User;
import hcmute.fit.event_management.service.IFollowService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import payload.Response;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/follow")
public class FollowController {

    @Autowired
    private IFollowService followService;

    @PostMapping("{userId}/follow/{organizerId}")
    public ResponseEntity<Response> followOrganizer(@PathVariable int userId, @PathVariable int organizerId) {
        return followService.followOrganizer(userId, organizerId);
    }

    @DeleteMapping("{userId}/unfollow/{organizerId}")
    public ResponseEntity<Response> unfollowOrganizer(@PathVariable int userId, @PathVariable int organizerId) {
        return followService.unfollowOrganizer(userId, organizerId);
    }

    @GetMapping("/followers/{organizerId}")
    public ResponseEntity<List<UserDTO>> getFollowers(@PathVariable int organizerId) {
        List<User> followers = followService.getFollowers(organizerId);
        List<UserDTO> list = new ArrayList<>();
        for (User user : followers) {
            UserDTO userDTO = new UserDTO();
            BeanUtils.copyProperties(user, userDTO);
            list.add(userDTO);
        }
        return ResponseEntity.ok(list);
    }

    @GetMapping("/list-org/{email}")
    public ResponseEntity<List<OrganizerDTO>> getFollowingOrganizers(@PathVariable String email) {
        List<OrganizerDTO> organizerDTOS = new ArrayList<>();
        List<Organizer> list = followService.getFollowingOrganizers(email);
        for (Organizer organizer : list) {
            OrganizerDTO organizerDTO = new OrganizerDTO();
            BeanUtils.copyProperties(organizer, organizerDTO);
            organizerDTOS.add(organizerDTO);
        }
        return ResponseEntity.ok(organizerDTOS);
    }

    @GetMapping("/followers/count/{organizerId}")
    public ResponseEntity<Response> getFollowersCount(@PathVariable int organizerId) {
        try {
            long count = followService.getFollowersCount(organizerId);
            return ResponseEntity.ok(new Response(200, "Success", count));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(new Response(400, "Not Found", e.getMessage()));
        }
    }

    @GetMapping("/following/count/{email}")
    public ResponseEntity<Response> getFollowingCount(@PathVariable String email) {
        try {
            long count = followService.getFollowingCount(email);
            return ResponseEntity.ok(new Response(200, "Success", count));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(new Response(400, "Not Found", e.getMessage()));
        }
    }
}
