package hcmute.fit.event_management.service.Impl;

import hcmute.fit.event_management.entity.Follow;
import hcmute.fit.event_management.entity.Organizer;
import hcmute.fit.event_management.entity.User;
import hcmute.fit.event_management.repository.FollowRepository;
import hcmute.fit.event_management.repository.OrganizerRepository;
import hcmute.fit.event_management.repository.UserRepository;
import hcmute.fit.event_management.service.IFollowService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import payload.Response;

import java.util.List;
import java.util.Optional;

@Service
public class FollowServiceImpl implements IFollowService {
    @Autowired
    private FollowRepository followRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizerRepository organizerRepository;

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Override
    public ResponseEntity<Response> followOrganizer(int userId, int organizerId) {
        Optional<User> followerOpt = userRepository.findById(userId);
        if (!followerOpt.isPresent()) {
            logger.error("User with email {} not found", userId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new Response(404, "Not Found", "User not found"));
        }

        Optional<Organizer> organizerOpt = organizerRepository.findById(organizerId);
        if (!organizerOpt.isPresent()) {
            logger.error("Organizer with ID {} not found", organizerId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new Response(404, "Not Found", "Organizer not found"));
        }

        User follower = followerOpt.get();
        Organizer organizer = organizerOpt.get();

        Optional<Follow> existingFollow = followRepository.findByFollowerAndOrganizer(follower, organizer);
        if (existingFollow.isPresent()) {
            logger.warn("User {} is already following organizer {}", userId, organizerId);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new Response(409, "Conflict", "Already following this organizer"));
        }

        Follow follow = new Follow();
        follow.setFollower(follower);
        follow.setOrganizer(organizer);
        followRepository.save(follow);

        logger.info("User {} followed organizer {}", userId, organizerId);
        return ResponseEntity.ok(new Response(200, "Success", "Followed organizer successfully"));
    }

    @Override
    public ResponseEntity<Response> unfollowOrganizer(int userId, int organizerId) {
        Optional<User> followerOpt = userRepository.findById(userId);
        if (!followerOpt.isPresent()) {
            logger.error("User with email {} not found", userId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new Response(404, "Not Found", "User not found"));
        }

        Optional<Organizer> organizerOpt = organizerRepository.findById(organizerId);
        if (!organizerOpt.isPresent()) {
            logger.error("Organizer with ID {} not found", organizerId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new Response(404, "Not Found", "Organizer not found"));
        }

        User follower = followerOpt.get();
        Organizer organizer = organizerOpt.get();

        Optional<Follow> existingFollow = followRepository.findByFollowerAndOrganizer(follower, organizer);
        if (!existingFollow.isPresent()) {
            logger.warn("User {} is not following organizer {}", userId, organizerId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new Response(404, "Not Found", "Not following this organizer"));
        }

        followRepository.delete(existingFollow.get());
        logger.info("User {} unfollowed organizer {}", userId, organizerId);
        return ResponseEntity.ok(new Response(200, "Success", "Unfollowed organizer successfully"));
    }

    @Override
    public List<User> getFollowers(int organizerId) {
        Optional<Organizer> organizerOpt = organizerRepository.findById(organizerId);
        if (!organizerOpt.isPresent()) {
            logger.error("Organizer with ID {} not found", organizerId);
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
        if (!followerOpt.isPresent()) {
            logger.error("User with email {} not found", followerEmail);
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
        if (!organizerOpt.isPresent()) {
            logger.error("Organizer with ID {} not found", organizerId);
            throw new RuntimeException("Organizer not found");
        }

        long count = followRepository.findByOrganizer(organizerOpt.get()).size();
        logger.info("Retrieved follower count for organizer {}: {}", organizerId, count);
        return count;
    }

    @Override
    public long getFollowingCount(String followerEmail) {
        Optional<User> followerOpt = userRepository.findByEmail(followerEmail);
        if (!followerOpt.isPresent()) {
            logger.error("User with email {} not found", followerEmail);
            throw new RuntimeException("User not found");
        }

        long count = followRepository.findByFollower(followerOpt.get()).size();
        logger.info("Retrieved following count for user {}: {}", followerEmail, count);
        return count;
    }

}
