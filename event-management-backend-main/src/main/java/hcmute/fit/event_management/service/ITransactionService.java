package hcmute.fit.event_management.service;

import hcmute.fit.event_management.entity.Transaction;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.FluentQuery;

import java.util.List;
import java.util.Optional;
import java.util.function.Function;

public interface ITransactionService {
    void flush();

    List<Transaction> findByOrganizer(int userId);

    double sumRevenueByOrganizer(int userId);

    List<Transaction> findAllById(Iterable<Integer> integers);

    void deleteAllByIdInBatch(Iterable<Integer> integers);

    long count();

    void delete(Transaction entity);

    List<Transaction> findAll();

    void deleteAllInBatch();

    void deleteById(Integer integer);

    List<Transaction> findAll(Sort sort);

    @Deprecated
    Transaction getOne(Integer integer);

    boolean existsById(Integer integer);

    @Deprecated
    Transaction getById(Integer integer);

    <S extends Transaction> Page<S> findAll(Example<S> example, Pageable pageable);

    Transaction getReferenceById(Integer integer);

    void deleteAll();

    <S extends Transaction> long count(Example<S> example);

    <S extends Transaction> S saveAndFlush(S entity);

    <S extends Transaction> List<S> findAll(Example<S> example);

    <S extends Transaction> List<S> saveAllAndFlush(Iterable<S> entities);

    Optional<Transaction> findById(Integer integer);

    <S extends Transaction> List<S> findAll(Example<S> example, Sort sort);

    <S extends Transaction> S save(S entity);

    void deleteAllById(Iterable<? extends Integer> integers);

    <S extends Transaction> boolean exists(Example<S> example);

    @Deprecated
    void deleteInBatch(Iterable<Transaction> entities);

    <S extends Transaction> List<S> saveAll(Iterable<S> entities);

    Page<Transaction> findAll(Pageable pageable);

    void deleteAll(Iterable<? extends Transaction> entities);

    <S extends Transaction> Optional<S> findOne(Example<S> example);

    void deleteAllInBatch(Iterable<Transaction> entities);

    <S extends Transaction, R> R findBy(Example<S> example, Function<FluentQuery.FetchableFluentQuery<S>, R> queryFunction);


    Optional<Transaction> findByOrderCode(String orderCode);

    double sumRevenueByOrganizerAndYear(int userId, int year);

    List<Transaction> findByOrganizerAndYear(int userId, int year);

    List<Transaction> findByBookingUserUserId(int userId);
}
