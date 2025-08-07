package hcmute.fit.event_management.repository;

import hcmute.fit.event_management.entity.Booking;
import hcmute.fit.event_management.entity.CheckInTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CheckInTicketRepository extends JpaRepository<CheckInTicket, String> {
    List<CheckInTicket> findByBookingDetailsBookingEventEventID(int eventID);
    @Query("SELECT c FROM CheckInTicket c WHERE c.bookingDetails.booking.user.userId = :userId " +
            "AND (:date IS NULL OR DATE(c.bookingDetails.booking.event.eventStart) = :date) " +
            "AND (:search IS NULL OR LOWER(c.bookingDetails.ticket.event.eventName) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(c.ticketCode) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<CheckInTicket> findByBookingDetailsBookingUserUserId(
            @Param("userId") int userId,
            @Param("date") LocalDate date,
            @Param("search") String search,
            Pageable pageable);
}
