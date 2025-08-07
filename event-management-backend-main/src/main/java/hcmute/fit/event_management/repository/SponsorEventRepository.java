package hcmute.fit.event_management.repository;


import hcmute.fit.event_management.entity.Sponsor;
import hcmute.fit.event_management.entity.SponsorEvent;
import hcmute.fit.event_management.entity.keys.SponsorEventId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SponsorEventRepository extends JpaRepository<SponsorEvent, SponsorEventId> {
    @Query("select sp from SponsorEvent sp where sp.event.eventID = :eventId")
    List<SponsorEvent> findByEventId(@Param("eventId") int eventId);

    @Query("select sp from  SponsorEvent sp where sp.event.eventID = :id and  sp.sponsor.sponsorId = :sponsorId")
    SponsorEvent findSponsorEvent(@Param("id") int id, @Param("sponsorId") int sponsorId);
    Boolean existsByIdEventIdAndIdSponsorId(int eventId, int sponsorId);
    @Query("SELECT COUNT(se) FROM SponsorEvent se WHERE se.event.user.userId = :userId")
    long countSponsorsByOrganizer(int userId);
    @Query("SELECT DISTINCT se.sponsor FROM SponsorEvent se WHERE se.event.user.userId = :userId")
    List<Sponsor> findDistinctSponsorsByEventUserUserId(@Param("userId") int userId);

    @Query("select sp from SponsorEvent sp where sp.event.eventID = :eventId")
    Page<SponsorEvent> findByEventId(@Param("eventId") int eventId, Pageable pageable);

    @Query("SELECT sp FROM SponsorEvent sp WHERE sp.event.eventID = :eventId " +
            "AND (:search IS NULL OR LOWER(sp.sponsor.sponsorName) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(sp.sponsor.sponsorEmail) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "AND (:level IS NULL OR sp.sponsorLevel = :level)")
    Page<SponsorEvent> findByEventIdWithFilters(@Param("eventId") int eventId,
                                                @Param("search") String search,
                                                @Param("level") String level,
                                                Pageable pageable);
    @Query("SELECT COUNT(se) FROM SponsorEvent se WHERE se.event.user.userId = :userId AND YEAR(se.event.eventStart) = :year")
    long countSponsorsByOrganizerAndYear(@Param("userId") int userId, @Param("year") int year);
}
