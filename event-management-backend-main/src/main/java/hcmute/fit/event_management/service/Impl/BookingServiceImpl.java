package hcmute.fit.event_management.service.Impl;

import hcmute.fit.event_management.entity.Booking;
import hcmute.fit.event_management.repository.BookingRepository;
import hcmute.fit.event_management.service.IBookingService;
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
public class BookingServiceImpl implements IBookingService {
    @Autowired
    BookingRepository bookingRepository;

    @Override
    public void flush() {
        bookingRepository.flush();
    }

    @Override
    public void deleteAllInBatch() {
        bookingRepository.deleteAllInBatch();
    }

    @Override
    public List<Booking> findAll(Sort sort) {
        return bookingRepository.findAll(sort);
    }

    @Override
    public void deleteAllByIdInBatch(Iterable<Integer> integers) {
        bookingRepository.deleteAllByIdInBatch(integers);
    }

    @Deprecated
    @Override
    public Booking getOne(Integer integer) {
        return bookingRepository.getOne(integer);
    }

    @Override
    public void delete(Booking entity) {
        bookingRepository.delete(entity);
    }

    @Override
    public void deleteAllById(Iterable<? extends Integer> integers) {
        bookingRepository.deleteAllById(integers);
    }

    @Override
    public List<Booking> findAllById(Iterable<Integer> integers) {
        return bookingRepository.findAllById(integers);
    }

    @Override
    public void deleteAllInBatch(Iterable<Booking> entities) {
        bookingRepository.deleteAllInBatch(entities);
    }

    @Deprecated
    @Override
    public Booking getById(Integer integer) {
        return bookingRepository.getById(integer);
    }

    @Override
    public <S extends Booking> S save(S entity) {
        return bookingRepository.save(entity);
    }

    @Override
    public List<Booking> findAll() {
        return bookingRepository.findAll();
    }

    @Override
    public void deleteAll(Iterable<? extends Booking> entities) {
        bookingRepository.deleteAll(entities);
    }

    @Override
    public <S extends Booking> Optional<S> findOne(Example<S> example) {
        return bookingRepository.findOne(example);
    }

    @Override
    public <S extends Booking> List<S> saveAll(Iterable<S> entities) {
        return bookingRepository.saveAll(entities);
    }

    @Override
    public Optional<Booking> findById(Integer integer) {
        return bookingRepository.findById(integer);
    }

    @Override
    public void deleteAll() {
        bookingRepository.deleteAll();
    }

    @Override
    public <S extends Booking> boolean exists(Example<S> example) {
        return bookingRepository.exists(example);
    }

    @Override
    public Page<Booking> findAll(Pageable pageable) {
        return bookingRepository.findAll(pageable);
    }

    @Override
    public <S extends Booking> S saveAndFlush(S entity) {
        return bookingRepository.saveAndFlush(entity);
    }

    @Override
    public <S extends Booking> List<S> findAll(Example<S> example, Sort sort) {
        return bookingRepository.findAll(example, sort);
    }

    @Override
    public boolean existsById(Integer integer) {
        return bookingRepository.existsById(integer);
    }

    @Override
    public <S extends Booking, R> R findBy(Example<S> example, Function<FluentQuery.FetchableFluentQuery<S>, R> queryFunction) {
        return bookingRepository.findBy(example, queryFunction);
    }

    @Deprecated
    @Override
    public void deleteInBatch(Iterable<Booking> entities) {
        bookingRepository.deleteInBatch(entities);
    }

    @Override
    public <S extends Booking> Page<S> findAll(Example<S> example, Pageable pageable) {
        return bookingRepository.findAll(example, pageable);
    }

    @Override
    public Booking getReferenceById(Integer integer) {
        return bookingRepository.getReferenceById(integer);
    }

    @Override
    public <S extends Booking> long count(Example<S> example) {
        return bookingRepository.count(example);
    }

    @Override
    public long count() {
        return bookingRepository.count();
    }

    @Override
    public <S extends Booking> List<S> saveAllAndFlush(Iterable<S> entities) {
        return bookingRepository.saveAllAndFlush(entities);
    }

    @Override
    public <S extends Booking> List<S> findAll(Example<S> example) {
        return bookingRepository.findAll(example);
    }

    @Override
    public void deleteById(Integer integer) {
        bookingRepository.deleteById(integer);
    }
    @Override
    public Optional<Booking> findByBookingCode(String code) {
        return bookingRepository.findByBookingCode(code);
    }


    @Override
    public boolean hasBoughtFreeTicket(int userId, int eventId) {
        List<Booking> freeTicketBookings = bookingRepository.findFreeTicketBookingsByUserAndEvent(userId, eventId);
        return !freeTicketBookings.isEmpty();
    }

    @Override
    public List<Booking> findByUserId(int userId) {
        return bookingRepository.findByUserId(userId);
    }
    @Override
    public List<Booking> findByEventEventID(int eventId) {
        return bookingRepository.findByEventEventID(eventId);
    }
    @Override
    public List<Booking> findByEventEventIDOrderByCreateDateDesc(int eventId) {
        return bookingRepository.findByEventEventIDOrderByCreateDateDesc(eventId);
    }
}
