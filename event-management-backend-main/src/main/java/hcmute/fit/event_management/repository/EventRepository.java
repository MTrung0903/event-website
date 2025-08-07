package hcmute.fit.event_management.repository;

import hcmute.fit.event_management.entity.Event;
import hcmute.fit.event_management.entity.EventType;
import hcmute.fit.event_management.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@Repository
public interface EventRepository extends JpaRepository<Event, Integer> {

    List<Event> findByEventNameContainingIgnoreCase(String eventName);
    List<Event> findByEventStart(LocalDateTime eventStart);
    List<Event> findByEventHostContainingIgnoreCase(String eventHost);
    List<Event> findByTagsContainingIgnoreCase(String tag);

    List<Event> findByEventType(EventType eventType);
    List<Event> findByEventLocationCityContainingIgnoreCase(String city);
    List<Event> findByEventLocationVenueNameContainingIgnoreCase(String venueName);
    List<Event> findByUser(User user);
    List<Event> findByEventHost(String eventHost);
    List<Event> findByEventStatusIgnoreCase(String eventStatus);
    List<Event> findByEventNameContainingIgnoreCaseAndEventLocationCityContainingIgnoreCase(String eventName, String city);
    @Query("SELECT e FROM Event e WHERE YEAR(e.eventStart) = :year")
    List<Event> findByYear(@Param("year") int year);
    @Query("select e from Event e where e.user.userId =:userId")
    List<Event> findByUserId(@Param("userId") Integer userId);

    @Query("select e from Event e where e.eventID = :eventId and e.user.userId = :userId")
    List<Event> findByEventIdAndUserId(@Param("eventId") Integer eventId, @Param("userId") Integer userId);
    @Query("SELECT COUNT(e) FROM Event e WHERE MONTH(e.eventStart) = :month AND YEAR(e.eventStart) = :year")
    long countEventsByMonth(@Param("month") int month, @Param("year") int year);
    List<Event> findByUserUserId(int userId);
    @Query("SELECT e FROM Event e WHERE e.user.userId = :userId AND YEAR(e.eventStart) = :year")
    List<Event> findByUserUserIdAndYear(@Param("userId") int userId, @Param("year") int year);
    Optional<Event> findByEventID(Integer eventId);

    @Query(value = "SELECT * FROM event WHERE WEEK(event_start, 1) = WEEK(CURRENT_DATE, 1) AND YEAR(event_start) = YEAR(CURRENT_DATE)", nativeQuery = true)
    List<Event> findEventsByCurrentWeek();

    @Query("SELECT e FROM Event e WHERE FUNCTION('MONTH', e.eventStart) = FUNCTION('MONTH', CURRENT_DATE) AND FUNCTION('YEAR', e.eventStart) = FUNCTION('YEAR', CURRENT_DATE)")
    List<Event> findEventsByCurrentMonth();

    @Query("select e from  Event e join Ticket t on e.eventID = t.event.eventID where t.ticketType = :type")
    List<Event> findEventsByTicketType(@Param("type") String type);

    @Query("SELECT e " +
            "FROM Event e " +
            "JOIN e.bookings b " +
            "JOIN b.bookingDetails bd " +
            "JOIN b.transaction t " +
            "WHERE b.bookingStatus = :status " +
            "AND t.transactionStatus = :transactionStatus " +
            "GROUP BY e " +
            "ORDER BY SUM(bd.quantity) DESC")
    List<Event> findTopEventsByTicketsSold(@Param("status") String status,
                                           @Param("transactionStatus") String transactionStatus, Pageable pageable);
    @Query("SELECT e FROM Event e " +
            "JOIN e.favoritedByUsers f " +
            "GROUP BY e " +
            "ORDER BY COUNT(f) DESC")
    List<Event> findTop10FavoriteEvents(Pageable pageable);

    @Query("SELECT e.eventLocation.city " +
            "FROM Event e " +
            "WHERE e.eventLocation.city IS NOT NULL AND e.eventLocation.city != ''" +
            "GROUP BY e.eventLocation.city " +
            "ORDER BY COUNT(e) DESC")
    List<String> findTop10CitiesByEventCount(Pageable pageable);

    @Query("SELECT e FROM Event e WHERE e.eventStatus IN (:statuses) OR e.eventEnd <= :endOfDay")
    List<Event> findEventsForStatusUpdate(@Param("statuses") List<String> statuses,
                                          @Param("endOfDay") LocalDateTime endOfDay);
    @Query("SELECT COUNT(e) FROM Event e WHERE YEAR(e.eventStart) = :year")
    long countEventsByYear(@Param("year") int year);

    @Query("SELECT e, " +
            "(SELECT COALESCE(SUM(bd.quantity), 0) " +
            " FROM Booking b JOIN b.bookingDetails bd " +
            " WHERE b.event = e) AS sold, " +
            "(SELECT COALESCE(SUM(t.transactionAmount * 0.03), 0) " +
            " FROM Booking b JOIN b.transaction t " +
            " WHERE b.event = e AND t.transactionStatus = 'SUCCESSFULLY') AS eventRevenue " +
            "FROM Event e " +
            "WHERE (:search IS NULL OR :search = '' OR " +
            "LOWER(e.eventName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(e.eventHost) LIKE LOWER(CONCAT('%', :search, '%'))) ")
    Page<Object[]> findWithFiltersAndCalculations(@Param("search") String search, Pageable pageable);

    @Query("select e.eventID from Event e ORDER BY e.eventID ASC")
    List<Integer> getAllEventIDs();
}
