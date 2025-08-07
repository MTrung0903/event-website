package hcmute.fit.event_management.repository;

import hcmute.fit.event_management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    Optional<User> findByFullName(String fullName);
    @Query("select u from User u join Organizer o on u.userId = o.user.userId where o.organizerName = :organizerName")
    Optional<User> findByOrganizerName(@Param("organizerName") String organizerName);
    @Query("SELECT u FROM User u WHERE u.isActive = true AND " +
            "(LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<User> findActiveUsersByFullNameOrEmail(@Param("query") String query);
}
