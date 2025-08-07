package hcmute.fit.event_management.repository;



import hcmute.fit.event_management.entity.Segment;
import hcmute.fit.event_management.entity.Speaker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface SegmentRepository extends JpaRepository<Segment, Integer> {
    @Query("select s from Segment s where s.event.eventID = :eventId")
    List<Segment> findByEventId(@Param("eventId") int eventId);
    @Query("select s.speaker from Segment s where s.event.eventID = :eventId")
    List<Speaker> getSpeakerByEventId(@Param("eventId") int eventId);
}

