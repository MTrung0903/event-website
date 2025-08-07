package hcmute.fit.event_management.repository;

import hcmute.fit.event_management.entity.Booking;
import hcmute.fit.event_management.entity.Refund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RefundRepository extends JpaRepository<Refund, Integer> {
}
