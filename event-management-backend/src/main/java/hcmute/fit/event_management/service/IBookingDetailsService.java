package hcmute.fit.event_management.service;

import hcmute.fit.event_management.dto.OrderTicketDTO;
import hcmute.fit.event_management.entity.BookingDetails;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.FluentQuery;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

public interface IBookingDetailsService {
    Optional<BookingDetails> findById(Integer integer);

    boolean existsById(Integer integer);

    long count();

    void deleteById(Integer integer);

    void delete(BookingDetails entity);

    void deleteAllById(Iterable<? extends Integer> integers);

    void deleteAll(Iterable<? extends BookingDetails> entities);

    void deleteAll();

    List<BookingDetails> findAll(Sort sort);

    Page<BookingDetails> findAll(Pageable pageable);

    <S extends BookingDetails> Optional<S> findOne(Example<S> example);

    <S extends BookingDetails> Page<S> findAll(Example<S> example, Pageable pageable);

    <S extends BookingDetails> long count(Example<S> example);

    <S extends BookingDetails> boolean exists(Example<S> example);

    <S extends BookingDetails, R> R findBy(Example<S> example, Function<FluentQuery.FetchableFluentQuery<S>, R> queryFunction);


    void deleteAllInBatch(Iterable<BookingDetails> entities);

    @Query("select bd from BookingDetails bd where bd.ticket.ticketId = :ticketId")
    List<BookingDetails> findByTicketId(int ticketId);

    @Query("select bd from BookingDetails bd where bd.booking.bookingId = :bookingId")
    List<BookingDetails> findByBookingId(int bookingId);

    void flush();

    <S extends BookingDetails> S saveAndFlush(S entity);

    <S extends BookingDetails> List<S> saveAllAndFlush(Iterable<S> entities);

    @Deprecated
    void deleteInBatch(Iterable<BookingDetails> entities);

    void deleteAllByIdInBatch(Iterable<Integer> integers);

    void deleteAllInBatch();

    @Deprecated
    BookingDetails getOne(Integer integer);

    @Deprecated
    BookingDetails getById(Integer integer);

    BookingDetails getReferenceById(Integer integer);

    <S extends BookingDetails> List<S> findAll(Example<S> example);

    <S extends BookingDetails> List<S> findAll(Example<S> example, Sort sort);

    <S extends BookingDetails> List<S> saveAll(Iterable<S> entities);

    List<BookingDetails> findAll();

    List<BookingDetails> findAllById(Iterable<Integer> integers);

    <S extends BookingDetails> S save(S entity);

    long countTicketsSoldByOrganizer(int userId);

    List<BookingDetails> findByTicketTicketId(int ticketId);

    long countTicketsSoldByOrganizerAndYear(int userId, int year);
}
