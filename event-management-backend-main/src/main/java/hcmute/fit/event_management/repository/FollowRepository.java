package hcmute.fit.event_management.repository;

import hcmute.fit.event_management.entity.Follow;
import hcmute.fit.event_management.entity.Organizer;
import hcmute.fit.event_management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Integer> {
    Optional<Follow> findByFollowerAndOrganizer(User follower, Organizer organizer);
    List<Follow> findByOrganizer(Organizer organizer);
    List<Follow> findByFollower(User follower);
}
