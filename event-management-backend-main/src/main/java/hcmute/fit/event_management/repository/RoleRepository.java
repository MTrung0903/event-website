package hcmute.fit.event_management.repository;

import hcmute.fit.event_management.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {

    Optional<Role> findByName(String name);

    @Query("select r from Role r where r.createdBy = :name")
    List<Role> findByCreatedBy(@Param("name") String name);

}
