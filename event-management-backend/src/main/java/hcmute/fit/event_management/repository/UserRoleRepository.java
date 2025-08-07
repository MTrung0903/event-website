package hcmute.fit.event_management.repository;

import hcmute.fit.event_management.entity.User;
import hcmute.fit.event_management.entity.UserRole;
import hcmute.fit.event_management.entity.keys.AccountRoleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, AccountRoleId> {
    void deleteAllByUser(User user);
    Optional<UserRole> findByUser(User user);
    Optional<List<UserRole>> findAllByUser(User user);
}
