package hcmute.fit.event_management.service;

import hcmute.fit.event_management.dto.TicketDTO;
import hcmute.fit.event_management.entity.Ticket;
import payload.Response;

import java.util.List;
import java.util.Optional;

public interface ITicketService {
    Optional<Ticket> findById(Integer integer);


    Response deleteById(Integer integer);

    void addTicket(int eventId, TicketDTO ticketDTO);

    List<TicketDTO> getTicketsByEventId(int eventId);

    void saveEditTicket(int eventId, TicketDTO ticketDTO) throws Exception;


    void deleteTicketByEventId(int eventId);

    List<Ticket> findByEventUserUserId(int userId);

    List<Ticket> findByEventEventID(int eventId);
    Response checkBeforeBuyTicket(String userEmail, int eventId);
    <S extends Ticket> S save(S entity);
}
