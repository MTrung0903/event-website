package hcmute.fit.event_management.repository;

import hcmute.fit.event_management.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Integer> {
    @Query("select t from Ticket t where t.event.eventID = :eventId")
    List<Ticket> findByEventID(@Param("eventId") int eventId);

    List<Ticket> findByEventUserUserId(int userId);
    List<Ticket> findByEventEventID(int eventId);
    @Query("SELECT t FROM Ticket t WHERE t.event.eventID = :eventId " +
            "AND t.ticketName = :ticketName " +
            "AND t.ticketType = :ticketType " +
            "AND t.price = :price " +
            "AND t.quantity = :quantity " +
            "AND t.startTime = :startTime " +
            "AND t.endTime = :endTime")
    Optional<Ticket> findByEventIdAndTicketNameAndTicketTypeAndPriceAndQuantityAndStartTimeAndEndTime(
            @Param("eventId") int eventId,
            @Param("ticketName") String ticketName,
            @Param("ticketType") String ticketType,
            @Param("price") double price,
            @Param("quantity") int quantity,
            @Param("startTime") Date startTime,
            @Param("endTime") Date endTime
    );
}
