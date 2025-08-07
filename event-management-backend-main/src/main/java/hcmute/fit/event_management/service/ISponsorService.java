package hcmute.fit.event_management.service;

import hcmute.fit.event_management.dto.SponsorDTO;
import hcmute.fit.event_management.dto.SponsorEventDTO;
import hcmute.fit.event_management.entity.Sponsor;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

public interface ISponsorService {

    <S extends Sponsor> List<S> findAll(Example<S> example);

    <S extends Sponsor> List<S> findAll(Example<S> example, Sort sort);

    List<Sponsor> findAll();

    List<Sponsor> findAllById(Iterable<Integer> integers);

    Optional<Sponsor> findById(Integer integer);

    long count();

    void deleteById(Integer integer);

    <S extends Sponsor> S save(S entity);

    List<Sponsor> findAll(Sort sort);

    Page<Sponsor> findAll(Pageable pageable);

    List<SponsorEventDTO> getAllSponsorsInEvent(int eventId);

    Optional<Sponsor> findBySponsorEmailOrSponsorPhone(String email, String phone);

}
