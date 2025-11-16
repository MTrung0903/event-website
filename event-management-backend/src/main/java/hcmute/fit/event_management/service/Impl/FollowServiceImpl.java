package hcmute.fit.event_management.service.Impl;

import hcmute.fit.event_management.entity.Follow;
import hcmute.fit.event_management.entity.Organizer;
import hcmute.fit.event_management.entity.User;
import hcmute.fit.event_management.repository.FollowRepository;
import hcmute.fit.event_management.repository.OrganizerRepository;
import hcmute.fit.event_management.repository.UserRepository;
import hcmute.fit.event_management.service.FollowService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import payload.Response;

import java.util.List;
import java.util.Optional;

@Service
public class FollowServiceImpl implements FollowService {

    private final FollowRepository followRepository;


    private final UserRepository userRepository;


    private final OrganizerRepository organizerRepository;

    public FollowServiceImpl(FollowRepository followRepository,
                             OrganizerRepository organizerRepository, UserRepository userRepository) {
        this.followRepository = followRepository;
        this.organizerRepository = organizerRepository;
        this.userRepository = userRepository;
    }

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Override
    public ResponseEntity<Response> followOrganizer(int userId, int organizerId) {
        Optional<User> followerOpt = userRepository.findById(userId);
        if (followerOpt.isEmpty()) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new Response(404, "Not Found", "User not found"));
        }

        Optional<Organizer> organizerOpt = organizerRepository.findById(organizerId);
        if (organizerOpt.isEmpty()) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new Response(404, "Not Found", "Organizer not found"));
        }

        User follower = followerOpt.get();
        Organizer organizer = organizerOpt.get();

        Optional<Follow> existingFollow = followRepository.findByFollowerAndOrganizer(follower, organizer);
        if (existingFollow.isPresent()) {

            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new Response(409, "Conflict", "Already following this organizer"));
        }

        Follow follow = new Follow();
        follow.setFollower(follower);
        follow.setOrganizer(organizer);
        followRepository.save(follow);


        return ResponseEntity.ok(new Response(200, "Success", "Followed organizer successfully"));
    }

    @Override
    public ResponseEntity<Response> unfollowOrganizer(int userId, int organizerId) {
        Optional<User> followerOpt = userRepository.findById(userId);
        if (followerOpt.isEmpty()) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new Response(404, "Not Found", "User not found"));
        }

        Optional<Organizer> organizerOpt = organizerRepository.findById(organizerId);
        if (organizerOpt.isEmpty()) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new Response(404, "Not Found", "Organizer not found"));
        }

        User follower = followerOpt.get();
        Organizer organizer = organizerOpt.get();

        Optional<Follow> existingFollow = followRepository.findByFollowerAndOrganizer(follower, organizer);
        if (existingFollow.isEmpty()) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new Response(404, "Not Found", "Not following this organizer"));
        }

        followRepository.delete(existingFollow.get());

        return ResponseEntity.ok(new Response(200, "Success", "Unfollowed organizer successfully"));
    }

    @Override
    public List<User> getFollowers(int organizerId) {
        Optional<Organizer> organizerOpt = organizerRepository.findById(organizerId);
        if (organizerOpt.isEmpty()) {

            throw new RuntimeException("Organizer not found");
        }

        return followRepository.findByOrganizer(organizerOpt.get())
                .stream()
                .map(Follow::getFollower)
                .toList();
    }

    @Override
    public List<Organizer> getFollowingOrganizers(String followerEmail) {
        Optional<User> followerOpt = userRepository.findByEmail(followerEmail);
        if (followerOpt.isEmpty()) {

            throw new RuntimeException("User not found");
        }

        return followRepository.findByFollower(followerOpt.get())
                .stream()
                .map(Follow::getOrganizer)
                .toList();
    }

    @Override
    public long getFollowersCount(int organizerId) {
        Optional<Organizer> organizerOpt = organizerRepository.findById(organizerId);
        if (organizerOpt.isEmpty()) {

            throw new RuntimeException("Organizer not found");
        }

        long count = followRepository.findByOrganizer(organizerOpt.get()).size();
        logger.info("Retrieved follower count for organizer {}: {}", organizerId, count);
        return count;
    }

    @Override
    public long getFollowingCount(String followerEmail) {
        Optional<User> followerOpt = userRepository.findByEmail(followerEmail);
        if (followerOpt.isEmpty()) {

            throw new RuntimeException("User not found");
        }

        return followRepository.findByFollower(followerOpt.get()).size();


    }

}
