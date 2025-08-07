package hcmute.fit.event_management.repository;

import feign.Param;
import hcmute.fit.event_management.entity.Booking;
import hcmute.fit.event_management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    Optional<Booking> findByBookingCode(String code);

    @Query("select b from Booking b where b.user.userId = :userId")
    List<Booking> findByUserId(@Param("userId") int userId);

    @Query("SELECT b FROM Booking b " +
            "JOIN b.bookingDetails bd " +
            "JOIN bd.ticket t " +
            "WHERE b.user.userId = :userId " +
            "AND b.event.eventID = :eventId " +
            "AND t.ticketType = 'Free' or t.ticketType='free'")
    List<Booking> findFreeTicketBookingsByUserAndEvent(@Param("userId") int userId,
                                                       @Param("eventId") int eventId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE MONTH(b.createDate) = :month AND YEAR(b.createDate) = :year")
    long countBookingsByMonth(@Param("month") int month, @Param("year") int year);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.bookingStatus = 'PAID'")
    long countBookings();
    List<Booking> findByEventEventID(int eventId);
    List<Booking> findByEventEventIDOrderByCreateDateDesc(int eventId);
    @Query("SELECT COUNT(b) FROM Booking b WHERE YEAR(b.createDate) = :year")
    long countBookingsByYear(@Param("year") int year);
}
