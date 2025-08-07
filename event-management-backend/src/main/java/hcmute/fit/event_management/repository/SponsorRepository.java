package hcmute.fit.event_management.repository;

import hcmute.fit.event_management.entity.Sponsor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SponsorRepository extends JpaRepository<Sponsor, Integer> {
    Optional<Sponsor> findBySponsorEmailOrSponsorPhone(String email, String phone);
}
