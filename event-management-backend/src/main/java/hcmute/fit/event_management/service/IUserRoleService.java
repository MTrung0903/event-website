package hcmute.fit.event_management.service;

import hcmute.fit.event_management.entity.UserRole;
import hcmute.fit.event_management.entity.keys.AccountRoleId;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.FluentQuery;

import java.util.List;
import java.util.Optional;
import java.util.function.Function;

public interface IUserRoleService {
    <S extends UserRole> S save(S entity);
    Optional<UserRole> findById(AccountRoleId accountRoleId);
    void deleteById(AccountRoleId accountRoleId);

}
