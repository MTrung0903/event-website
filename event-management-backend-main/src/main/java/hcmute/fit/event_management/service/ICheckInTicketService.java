package hcmute.fit.event_management.service;

import hcmute.fit.event_management.entity.Booking;
import hcmute.fit.event_management.entity.CheckInTicket;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.FluentQuery;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

public interface ICheckInTicketService {
    void flush();

    <S extends CheckInTicket> boolean exists(Example<S> example);

    <S extends CheckInTicket> List<S> saveAllAndFlush(Iterable<S> entities);

    boolean existsById(String s);

    <S extends CheckInTicket> List<S> findAll(Example<S> example, Sort sort);

    <S extends CheckInTicket> long count(Example<S> example);

    <S extends CheckInTicket> List<S> saveAll(Iterable<S> entities);

    <S extends CheckInTicket> S saveAndFlush(S entity);

    Optional<CheckInTicket> findById(String s);

    Page<CheckInTicket> findAll(Pageable pageable);

    <S extends CheckInTicket> List<S> findAll(Example<S> example);

    void deleteAll();

    <S extends CheckInTicket> Optional<S> findOne(Example<S> example);

    void deleteAllInBatch(Iterable<CheckInTicket> entities);

    void deleteAll(Iterable<? extends CheckInTicket> entities);

    <S extends CheckInTicket> S save(S entity);

    void deleteAllById(Iterable<? extends String> strings);

    <S extends CheckInTicket, R> R findBy(Example<S> example, Function<FluentQuery.FetchableFluentQuery<S>, R> queryFunction);

    @Deprecated
    void deleteInBatch(Iterable<CheckInTicket> entities);

    void delete(CheckInTicket entity);

    void deleteAllInBatch();

    List<CheckInTicket> findAll(Sort sort);

    @Deprecated
    CheckInTicket getOne(String s);

    void deleteAllByIdInBatch(Iterable<String> strings);

    void deleteById(String s);

    long count();

    CheckInTicket getReferenceById(String s);

    List<CheckInTicket> findAll();

    <S extends CheckInTicket> Page<S> findAll(Example<S> example, Pageable pageable);

    List<CheckInTicket> findAllById(Iterable<String> strings);

    @Deprecated
    CheckInTicket getById(String s);

    List<CheckInTicket> findByBookingDetailsBookingEventEventID(int eventID);


    Page<CheckInTicket> findByBookingDetailsBookingUserUserId(int userId, LocalDate date, String search, Pageable pageable);
}
