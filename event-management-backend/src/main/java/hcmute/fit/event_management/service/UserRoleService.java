package hcmute.fit.event_management.service;

import hcmute.fit.event_management.entity.UserRole;
import hcmute.fit.event_management.entity.keys.AccountRoleId;

import java.util.Optional;

public interface UserRoleService {
    <S extends UserRole> S save(S entity);
    Optional<UserRole> findById(AccountRoleId accountRoleId);
    void deleteById(AccountRoleId accountRoleId);

}
