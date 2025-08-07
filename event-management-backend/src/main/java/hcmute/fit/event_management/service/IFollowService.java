package hcmute.fit.event_management.service;

import hcmute.fit.event_management.entity.Organizer;
import hcmute.fit.event_management.entity.User;
import org.springframework.http.ResponseEntity;
import payload.Response;

import java.util.List;

public interface IFollowService {
    ResponseEntity<Response> followOrganizer(int userId, int organizerId);

    ResponseEntity<Response> unfollowOrganizer(int userId, int organizerId);

    List<User> getFollowers(int organizerId);

    List<Organizer> getFollowingOrganizers(String followerEmail);

    long getFollowersCount(int organizerId);

    long getFollowingCount(String followerEmail);
}
