package hcmute.fit.event_management.service.Impl;

import hcmute.fit.event_management.entity.BookingDetails;
import hcmute.fit.event_management.repository.BookingDetailsRepository;
import hcmute.fit.event_management.service.IBookingDetailsService;
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
public class BookingDetailsServiceImpl implements IBookingDetailsService {
    @Autowired
    private BookingDetailsRepository bookingDetailsRepository;

    @Override
    public Optional<BookingDetails> findById(Integer integer) {
        return bookingDetailsRepository.findById(integer);
    }

    @Override
    public boolean existsById(Integer integer) {
        return bookingDetailsRepository.existsById(integer);
    }

    @Override
    public long count() {
        return bookingDetailsRepository.count();
    }

    @Override
    public void deleteById(Integer integer) {
        bookingDetailsRepository.deleteById(integer);
    }

    @Override
    public void delete(BookingDetails entity) {
        bookingDetailsRepository.delete(entity);
    }

    @Override
    public void deleteAllById(Iterable<? extends Integer> integers) {
        bookingDetailsRepository.deleteAllById(integers);
    }

    @Override
    public void deleteAll(Iterable<? extends BookingDetails> entities) {
        bookingDetailsRepository.deleteAll(entities);
    }

    @Override
    public void deleteAll() {
        bookingDetailsRepository.deleteAll();
    }

    @Override
    public List<BookingDetails> findAll(Sort sort) {
        return bookingDetailsRepository.findAll(sort);
    }

    @Override
    public Page<BookingDetails> findAll(Pageable pageable) {
        return bookingDetailsRepository.findAll(pageable);
    }

    @Override
    public <S extends BookingDetails> Optional<S> findOne(Example<S> example) {
        return bookingDetailsRepository.findOne(example);
    }

    @Override
    public <S extends BookingDetails> Page<S> findAll(Example<S> example, Pageable pageable) {
        return bookingDetailsRepository.findAll(example, pageable);
    }

    @Override
    public <S extends BookingDetails> long count(Example<S> example) {
        return bookingDetailsRepository.count(example);
    }

    @Override
    public <S extends BookingDetails> boolean exists(Example<S> example) {
        return bookingDetailsRepository.exists(example);
    }

    @Override
    public <S extends BookingDetails, R> R findBy(Example<S> example, Function<FluentQuery.FetchableFluentQuery<S>, R> queryFunction) {
        return bookingDetailsRepository.findBy(example, queryFunction);
    }

    @Override
    public void deleteAllInBatch(Iterable<BookingDetails> entities) {
        bookingDetailsRepository.deleteAllInBatch(entities);
    }


    @Override
    public List<BookingDetails> findByTicketId(int ticketId) {
        return bookingDetailsRepository.findByTicketId(ticketId);
    }


    @Override
    public List<BookingDetails> findByBookingId(int bookingId) {
        return bookingDetailsRepository.findByBookingId(bookingId);
    }

    @Override
    public void flush() {
        bookingDetailsRepository.flush();
    }

    @Override
    public <S extends BookingDetails> S saveAndFlush(S entity) {
        return bookingDetailsRepository.saveAndFlush(entity);
    }

    @Override
    public <S extends BookingDetails> List<S> saveAllAndFlush(Iterable<S> entities) {
        return bookingDetailsRepository.saveAllAndFlush(entities);
    }

    @Deprecated
    @Override
    public void deleteInBatch(Iterable<BookingDetails> entities) {
        bookingDetailsRepository.deleteInBatch(entities);
    }

    @Override
    public void deleteAllByIdInBatch(Iterable<Integer> integers) {
        bookingDetailsRepository.deleteAllByIdInBatch(integers);
    }

    @Override
    public void deleteAllInBatch() {
        bookingDetailsRepository.deleteAllInBatch();
    }

    @Deprecated
    @Override
    public BookingDetails getOne(Integer integer) {
        return bookingDetailsRepository.getOne(integer);
    }

    @Deprecated
    @Override
    public BookingDetails getById(Integer integer) {
        return bookingDetailsRepository.getById(integer);
    }

    @Override
    public BookingDetails getReferenceById(Integer integer) {
        return bookingDetailsRepository.getReferenceById(integer);
    }

    @Override
    public <S extends BookingDetails> List<S> findAll(Example<S> example) {
        return bookingDetailsRepository.findAll(example);
    }

    @Override
    public <S extends BookingDetails> List<S> findAll(Example<S> example, Sort sort) {
        return bookingDetailsRepository.findAll(example, sort);
    }

    @Override
    public <S extends BookingDetails> List<S> saveAll(Iterable<S> entities) {
        return bookingDetailsRepository.saveAll(entities);
    }

    @Override
    public List<BookingDetails> findAll() {
        return bookingDetailsRepository.findAll();
    }

    @Override
    public List<BookingDetails> findAllById(Iterable<Integer> integers) {
        return bookingDetailsRepository.findAllById(integers);
    }

    @Override
    public <S extends BookingDetails> S save(S entity) {
        return bookingDetailsRepository.save(entity);
    }
    @Override
    public long countTicketsSoldByOrganizer(int userId) {
        return bookingDetailsRepository.countTicketsSoldByOrganizer(userId);
    }
    @Override
    public List<BookingDetails> findByTicketTicketId(int ticketId) {
        return bookingDetailsRepository.findByTicketTicketId(ticketId);
    }
    @Override
    public long countTicketsSoldByOrganizerAndYear(int userId, int year) {
        return bookingDetailsRepository.countTicketsSoldByOrganizerAndYear(userId, year);
    }
}
