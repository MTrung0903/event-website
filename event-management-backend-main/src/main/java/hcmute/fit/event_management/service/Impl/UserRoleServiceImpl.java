package hcmute.fit.event_management.service.Impl;

import hcmute.fit.event_management.entity.UserRole;
import hcmute.fit.event_management.entity.keys.AccountRoleId;
import hcmute.fit.event_management.repository.UserRoleRepository;
import hcmute.fit.event_management.service.IUserRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.FluentQuery;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.function.Function;

@Service
public class UserRoleServiceImpl implements IUserRoleService {
    @Autowired
    UserRoleRepository userRoleRepository;

    @Override
    public <S extends UserRole> S save(S entity) {
        return userRoleRepository.save(entity);
    }

    @Override
    public Optional<UserRole> findById(AccountRoleId accountRoleId) {
        return userRoleRepository.findById(accountRoleId);
    }

    @Override
    public void deleteById(AccountRoleId accountRoleId) {
        userRoleRepository.deleteById(accountRoleId);
    }

}
