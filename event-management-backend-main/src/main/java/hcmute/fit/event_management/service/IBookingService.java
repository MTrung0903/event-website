package hcmute.fit.event_management.service;

import hcmute.fit.event_management.entity.Booking;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.FluentQuery;

import java.util.List;
import java.util.Optional;
import java.util.function.Function;

public interface IBookingService {
    void flush();

    void deleteAllInBatch();

    List<Booking> findAll(Sort sort);

    void deleteAllByIdInBatch(Iterable<Integer> integers);

    @Deprecated
    Booking getOne(Integer integer);

    void delete(Booking entity);

    void deleteAllById(Iterable<? extends Integer> integers);

    List<Booking> findAllById(Iterable<Integer> integers);

    void deleteAllInBatch(Iterable<Booking> entities);

    @Deprecated
    Booking getById(Integer integer);

    <S extends Booking> S save(S entity);

    List<Booking> findAll();

    void deleteAll(Iterable<? extends Booking> entities);

    <S extends Booking> Optional<S> findOne(Example<S> example);

    <S extends Booking> List<S> saveAll(Iterable<S> entities);

    Optional<Booking> findById(Integer integer);

    void deleteAll();

    <S extends Booking> boolean exists(Example<S> example);

    Page<Booking> findAll(Pageable pageable);

    <S extends Booking> S saveAndFlush(S entity);

    <S extends Booking> List<S> findAll(Example<S> example, Sort sort);

    boolean existsById(Integer integer);

    <S extends Booking, R> R findBy(Example<S> example, Function<FluentQuery.FetchableFluentQuery<S>, R> queryFunction);

    @Deprecated
    void deleteInBatch(Iterable<Booking> entities);

    <S extends Booking> Page<S> findAll(Example<S> example, Pageable pageable);

    Booking getReferenceById(Integer integer);

    <S extends Booking> long count(Example<S> example);

    long count();

    <S extends Booking> List<S> saveAllAndFlush(Iterable<S> entities);

    <S extends Booking> List<S> findAll(Example<S> example);

    void deleteById(Integer integer);

    Optional<Booking> findByBookingCode(String code);

    boolean hasBoughtFreeTicket(int userId, int eventId);

    List<Booking> findByUserId(int userId);


    List<Booking> findByEventEventID(int eventId);

    List<Booking> findByEventEventIDOrderByCreateDateDesc(int eventId);
}
