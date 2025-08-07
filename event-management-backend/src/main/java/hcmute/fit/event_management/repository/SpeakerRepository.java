package hcmute.fit.event_management.repository;

import hcmute.fit.event_management.entity.Speaker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SpeakerRepository extends JpaRepository<Speaker, Integer> {
    @Query("select m from Speaker m WHERE m.speakerName = :desc OR m.speakerEmail = :desc  OR m.speakerPhone= :desc ")
    Speaker findByNameOrEmaiOrPhone(@Param("desc") String desc);
}