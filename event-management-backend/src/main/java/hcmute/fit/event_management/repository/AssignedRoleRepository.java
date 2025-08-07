package hcmute.fit.event_management.repository;

import hcmute.fit.event_management.entity.AssignedRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignedRoleRepository extends JpaRepository<AssignedRole, Integer> {
    @Query("select a from AssignedRole a where a.event.eventID = :eventId")
    List<AssignedRole> findByEvent (@Param("eventId") int eventId);

    @Query("select a from AssignedRole a where a.user.userId = :userId and a.role.roleId = :roleId and a.event.eventID = :eventId")
    Optional<AssignedRole> getAssigned(@Param("userId") int userId,@Param("roleId") int roleId, @Param("eventId") int eventId);

    @Query("select a from AssignedRole a where a.user.userId = :userId and a.event.eventID = :eventId")
    Optional<AssignedRole> findByUserIdAndEventId(@Param("userId") int userId,@Param("eventId") int eventId);

    @Query("select a from AssignedRole a where a.user.userId = :userId")
    List<AssignedRole> findByUserUserId(@Param("userId") int userId);

    @Query("select a.role.name from AssignedRole a where a.user.userId = :userId  and a.event.eventID = :eventId")
    List<String> getRoleNameAssigned(@Param("userId") int userId, @Param("eventId") int eventId);


}
