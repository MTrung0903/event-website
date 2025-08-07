package hcmute.fit.event_management.repository;

import hcmute.fit.event_management.entity.Organizer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizerRepository extends JpaRepository<Organizer, Integer> {
    Optional<Organizer> findByOrganizerName(String organizerName);
    @Query("SELECT COUNT(o) FROM Organizer o WHERE MONTH(o.registrationDate) = :month AND YEAR(o.registrationDate) = :year")
    long countOrganizersByMonth(@Param("month") int month, @Param("year") int year);
    @Query("SELECT COUNT(o) FROM Organizer o WHERE YEAR(o.registrationDate) = :year")
    long countOrganizersByYear(@Param("year") int year);
    Organizer findByUserUserId(int userId);

}
