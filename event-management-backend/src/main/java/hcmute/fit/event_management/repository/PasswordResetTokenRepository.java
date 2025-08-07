package hcmute.fit.event_management.repository;

import hcmute.fit.event_management.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Integer> {
    Optional<PasswordResetToken> findByToken(String token);
    void delete(PasswordResetToken entity);
    Optional<PasswordResetToken> findByUserId(int id);
}
