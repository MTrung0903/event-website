package hcmute.fit.event_management.repository;

import hcmute.fit.event_management.dto.EventDTO;
import hcmute.fit.event_management.dto.EventSalesDTO;
import hcmute.fit.event_management.entity.BookingDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingDetailsRepository extends JpaRepository<BookingDetails, Integer> {
    @Query("select bd from BookingDetails bd where bd.ticket.ticketId = :ticketId")
    List<BookingDetails> findByTicketId(@Param("ticketId") int ticketId);
    @Query("select bd from BookingDetails bd where bd.booking.bookingId = :bookingId")
    List<BookingDetails> findByBookingId(@Param("bookingId") int bookingId);
    @Query("SELECT COALESCE(SUM(bd.quantity),0) FROM BookingDetails bd")
    Long countTotalTicketsSold();
    @Query("SELECT COALESCE(SUM(bd.quantity),0) FROM BookingDetails bd WHERE MONTH(bd.booking.createDate) = :month AND YEAR(bd.booking.createDate) = :year")
    Long countTicketsSoldByMonth(@Param("month") int month, @Param("year") int year);
    @Query("SELECT COALESCE(SUM(bd.quantity), 0) FROM BookingDetails bd WHERE YEAR(bd.booking.createDate) = :year")
    Long countTicketsSoldByYear(@Param("year") int year);
    @Query(value = """
    SELECT e.event_id AS eventId, e.event_name AS eventName, e.venue_name AS venueName,
           e.event_type AS eventType, SUM(bd.quantity) AS totalQuantity,
           SUM(bd.price) AS totalRevenue, e.event_status AS eventStatus,
           (SELECT ei.event_images FROM event_event_images ei WHERE ei.event_event_id = e.event_id LIMIT 1) AS eventImage
    FROM booking_details bd
    JOIN ticket t ON t.ticket_id = bd.ticket_id
    JOIN event e ON e.event_id = t.event_id
    JOIN booking b ON b.booking_id = bd.booking_id
    WHERE b.booking_status = 'PAID'
    GROUP BY e.event_id, e.event_name, e.venue_name, e.event_type, e.event_status
    """, nativeQuery = true)
    List<Object[]> getEventSalesSummaryWithImage();
    @Query("SELECT COALESCE(SUM(bd.quantity), 0) FROM BookingDetails bd WHERE bd.booking.event.user.userId = :userId")
    long countTicketsSoldByOrganizer(int userId);
    List<BookingDetails> findByTicketTicketId(int ticketId);
    @Query("SELECT COALESCE(SUM(bd.quantity), 0) FROM BookingDetails bd WHERE bd.booking.event.user.userId = :userId AND YEAR(bd.booking.createDate) = :year")
    long countTicketsSoldByOrganizerAndYear(@Param("userId") int userId, @Param("year") int year);
}
