package hcmute.fit.event_management.service.Impl;

import hcmute.fit.event_management.entity.Transaction;
import hcmute.fit.event_management.repository.TransactionRepository;
import hcmute.fit.event_management.service.ITransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.FluentQuery;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.function.Function;

@Service
public class TransactionServiceImpl implements ITransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Override
    public void flush() {
        transactionRepository.flush();
    }
    @Override
    public List<Transaction> findByOrganizer(int userId) {
        return transactionRepository.findByOrganizer(userId);
    }
    @Override
    public double sumRevenueByOrganizer(int userId) {
        return transactionRepository.sumRevenueByOrganizer(userId);
    }

    @Override
    public List<Transaction> findAllById(Iterable<Integer> integers) {
        return transactionRepository.findAllById(integers);
    }

    @Override
    public void deleteAllByIdInBatch(Iterable<Integer> integers) {
        transactionRepository.deleteAllByIdInBatch(integers);
    }

    @Override
    public long count() {
        return transactionRepository.count();
    }

    @Override
    public void delete(Transaction entity) {
        transactionRepository.delete(entity);
    }

    @Override
    public List<Transaction> findAll() {
        return transactionRepository.findAll();
    }

    @Override
    public void deleteAllInBatch() {
        transactionRepository.deleteAllInBatch();
    }

    @Override
    public void deleteById(Integer integer) {
        transactionRepository.deleteById(integer);
    }

    @Override
    public List<Transaction> findAll(Sort sort) {
        return transactionRepository.findAll(sort);
    }

    @Deprecated
    @Override
    public Transaction getOne(Integer integer) {
        return transactionRepository.getOne(integer);
    }

    @Override
    public boolean existsById(Integer integer) {
        return transactionRepository.existsById(integer);
    }

    @Deprecated
    @Override
    public Transaction getById(Integer integer) {
        return transactionRepository.getById(integer);
    }

    @Override
    public <S extends Transaction> Page<S> findAll(Example<S> example, Pageable pageable) {
        return transactionRepository.findAll(example, pageable);
    }

    @Override
    public Transaction getReferenceById(Integer integer) {
        return transactionRepository.getReferenceById(integer);
    }

    @Override
    public void deleteAll() {
        transactionRepository.deleteAll();
    }

    @Override
    public <S extends Transaction> long count(Example<S> example) {
        return transactionRepository.count(example);
    }

    @Override
    public <S extends Transaction> S saveAndFlush(S entity) {
        return transactionRepository.saveAndFlush(entity);
    }

    @Override
    public <S extends Transaction> List<S> findAll(Example<S> example) {
        return transactionRepository.findAll(example);
    }

    @Override
    public <S extends Transaction> List<S> saveAllAndFlush(Iterable<S> entities) {
        return transactionRepository.saveAllAndFlush(entities);
    }

    @Override
    public Optional<Transaction> findById(Integer integer) {
        return transactionRepository.findById(integer);
    }

    @Override
    public <S extends Transaction> List<S> findAll(Example<S> example, Sort sort) {
        return transactionRepository.findAll(example, sort);
    }

    @Override
    public <S extends Transaction> S save(S entity) {
        return transactionRepository.save(entity);
    }

    @Override
    public void deleteAllById(Iterable<? extends Integer> integers) {
        transactionRepository.deleteAllById(integers);
    }

    @Override
    public <S extends Transaction> boolean exists(Example<S> example) {
        return transactionRepository.exists(example);
    }

    @Deprecated
    @Override
    public void deleteInBatch(Iterable<Transaction> entities) {
        transactionRepository.deleteInBatch(entities);
    }

    @Override
    public <S extends Transaction> List<S> saveAll(Iterable<S> entities) {
        return transactionRepository.saveAll(entities);
    }

    @Override
    public Page<Transaction> findAll(Pageable pageable) {
        return transactionRepository.findAll(pageable);
    }

    @Override
    public void deleteAll(Iterable<? extends Transaction> entities) {
        transactionRepository.deleteAll(entities);
    }

    @Override
    public <S extends Transaction> Optional<S> findOne(Example<S> example) {
        return transactionRepository.findOne(example);
    }

    @Override
    public void deleteAllInBatch(Iterable<Transaction> entities) {
        transactionRepository.deleteAllInBatch(entities);
    }

    @Override
    public <S extends Transaction, R> R findBy(Example<S> example, Function<FluentQuery.FetchableFluentQuery<S>, R> queryFunction) {
        return transactionRepository.findBy(example, queryFunction);
    }

    @Override
    public Optional<Transaction> findByOrderCode(String orderCode) {
        return transactionRepository.findByOrderCode(orderCode);
    }
    @Override
    public double sumRevenueByOrganizerAndYear(int userId, int year) {
        return transactionRepository.sumRevenueByOrganizerAndYear(userId, year);
    }
    @Override
    public List<Transaction> findByOrganizerAndYear(int userId, int year) {
        return transactionRepository.findByOrganizerAndYear(userId, year);
    }
    @Override
    public List<Transaction> findByBookingUserUserId(int userId) {
        return transactionRepository.findByBookingUserUserId(userId);
    }
}
