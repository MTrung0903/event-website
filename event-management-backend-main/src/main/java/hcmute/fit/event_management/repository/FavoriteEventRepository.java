package hcmute.fit.event_management.repository;

import hcmute.fit.event_management.entity.FavoriteEvent;
import hcmute.fit.event_management.entity.keys.FavoriteEventId;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteEventRepository extends JpaRepository<FavoriteEvent, FavoriteEventId> {
    @Query("SELECT COUNT(f) > 0 FROM FavoriteEvent f WHERE f.user.userId = :userId AND f.event.eventID = :eventId")
    boolean existsByUserIdAndEventId(@Param("userId") int userId,@Param("eventId") int eventId);

    @Query("select f from FavoriteEvent f where f.user.userId = :userId ")
    List<FavoriteEvent> findByUserId(@Param("userId") int userId);
    @Query("select f from FavoriteEvent f where f.user.userId = :userId and f.event.eventID = :eventId")
    Optional<FavoriteEvent> findByUserIdAndEventId(@Param("userId") int userId,@Param("eventId") int eventId);
}
