package hcmute.fit.event_management.repository;

import hcmute.fit.event_management.entity.EventView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventViewRepository extends JpaRepository<EventView, Long> {

    @Query("SELECT ev.event.eventID, COUNT(ev.id) as viewCount " +
            "FROM EventView ev " +
            "GROUP BY ev.event.eventID " +
            "ORDER BY viewCount DESC")
    List<Object[]> findTopViewedEvents();

    // Truy vấn để kiểm tra lượt xem trùng lặp (nếu cần)
    @Query("SELECT COUNT(ev) FROM EventView ev WHERE ev.event.eventID = :eventId AND ev.user.userId = :userId AND ev.viewTimestamp > :threshold")
    long countRecentViewsByUser(@Param("eventId") Integer eventId, @Param("userId") Integer userId, @Param("threshold") LocalDateTime threshold);

    long countByEventEventID(Integer eventId);

    @Query("select e from EventView e where e.event.eventID = :eventId")
   List<EventView> getEventView(@Param("eventId") Integer eventId);
}