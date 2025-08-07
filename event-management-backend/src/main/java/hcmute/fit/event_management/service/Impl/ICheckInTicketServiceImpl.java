package hcmute.fit.event_management.service.Impl;

import hcmute.fit.event_management.entity.CheckInTicket;
import hcmute.fit.event_management.repository.CheckInTicketRepository;
import hcmute.fit.event_management.service.ICheckInTicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.FluentQuery;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

@Service
public class ICheckInTicketServiceImpl implements ICheckInTicketService {
    @Autowired
    CheckInTicketRepository checkInTicketRepository;

    @Override
    public void flush() {
        checkInTicketRepository.flush();
    }

    @Override
    public <S extends CheckInTicket> boolean exists(Example<S> example) {
        return checkInTicketRepository.exists(example);
    }

    @Override
    public <S extends CheckInTicket> List<S> saveAllAndFlush(Iterable<S> entities) {
        return checkInTicketRepository.saveAllAndFlush(entities);
    }

    @Override
    public boolean existsById(String s) {
        return checkInTicketRepository.existsById(s);
    }

    @Override
    public <S extends CheckInTicket> List<S> findAll(Example<S> example, Sort sort) {
        return checkInTicketRepository.findAll(example, sort);
    }

    @Override
    public <S extends CheckInTicket> long count(Example<S> example) {
        return checkInTicketRepository.count(example);
    }

    @Override
    public <S extends CheckInTicket> List<S> saveAll(Iterable<S> entities) {
        return checkInTicketRepository.saveAll(entities);
    }

    @Override
    public <S extends CheckInTicket> S saveAndFlush(S entity) {
        return checkInTicketRepository.saveAndFlush(entity);
    }

    @Override
    public Optional<CheckInTicket> findById(String s) {
        return checkInTicketRepository.findById(s);
    }

    @Override
    public Page<CheckInTicket> findAll(Pageable pageable) {
        return checkInTicketRepository.findAll(pageable);
    }

    @Override
    public <S extends CheckInTicket> List<S> findAll(Example<S> example) {
        return checkInTicketRepository.findAll(example);
    }

    @Override
    public void deleteAll() {
        checkInTicketRepository.deleteAll();
    }

    @Override
    public <S extends CheckInTicket> Optional<S> findOne(Example<S> example) {
        return checkInTicketRepository.findOne(example);
    }

    @Override
    public void deleteAllInBatch(Iterable<CheckInTicket> entities) {
        checkInTicketRepository.deleteAllInBatch(entities);
    }

    @Override
    public void deleteAll(Iterable<? extends CheckInTicket> entities) {
        checkInTicketRepository.deleteAll(entities);
    }

    @Override
    public <S extends CheckInTicket> S save(S entity) {
        return checkInTicketRepository.save(entity);
    }

    @Override
    public void deleteAllById(Iterable<? extends String> strings) {
        checkInTicketRepository.deleteAllById(strings);
    }

    @Override
    public <S extends CheckInTicket, R> R findBy(Example<S> example, Function<FluentQuery.FetchableFluentQuery<S>, R> queryFunction) {
        return checkInTicketRepository.findBy(example, queryFunction);
    }

    @Deprecated
    @Override
    public void deleteInBatch(Iterable<CheckInTicket> entities) {
        checkInTicketRepository.deleteInBatch(entities);
    }

    @Override
    public void delete(CheckInTicket entity) {
        checkInTicketRepository.delete(entity);
    }

    @Override
    public void deleteAllInBatch() {
        checkInTicketRepository.deleteAllInBatch();
    }

    @Override
    public List<CheckInTicket> findAll(Sort sort) {
        return checkInTicketRepository.findAll(sort);
    }

    @Deprecated
    @Override
    public CheckInTicket getOne(String s) {
        return checkInTicketRepository.getOne(s);
    }

    @Override
    public void deleteAllByIdInBatch(Iterable<String> strings) {
        checkInTicketRepository.deleteAllByIdInBatch(strings);
    }

    @Override
    public void deleteById(String s) {
        checkInTicketRepository.deleteById(s);
    }

    @Override
    public long count() {
        return checkInTicketRepository.count();
    }

    @Override
    public CheckInTicket getReferenceById(String s) {
        return checkInTicketRepository.getReferenceById(s);
    }

    @Override
    public List<CheckInTicket> findAll() {
        return checkInTicketRepository.findAll();
    }

    @Override
    public <S extends CheckInTicket> Page<S> findAll(Example<S> example, Pageable pageable) {
        return checkInTicketRepository.findAll(example, pageable);
    }

    @Override
    public List<CheckInTicket> findAllById(Iterable<String> strings) {
        return checkInTicketRepository.findAllById(strings);
    }

    @Deprecated
    @Override
    public CheckInTicket getById(String s) {
        return checkInTicketRepository.getById(s);
    }
    @Override
    public List<CheckInTicket> findByBookingDetailsBookingEventEventID(int eventID) {
        return checkInTicketRepository.findByBookingDetailsBookingEventEventID(eventID);
    }

    @Override
    public Page<CheckInTicket> findByBookingDetailsBookingUserUserId(int userId, LocalDate date, String search, Pageable pageable) {
        return checkInTicketRepository.findByBookingDetailsBookingUserUserId(userId, date, search, pageable);
    }
}
