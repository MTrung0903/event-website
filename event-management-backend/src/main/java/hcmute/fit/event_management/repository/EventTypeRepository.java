package hcmute.fit.event_management.repository;

import hcmute.fit.event_management.entity.EventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventTypeRepository extends JpaRepository<EventType, Long> {
    EventType findByTypeName(String typeName);
    boolean existsByTypeName(String typeName);
    List<EventType> findByTypeNameContainingIgnoreCase(String typeName);
}
