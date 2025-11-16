package hcmute.fit.event_management.service.Impl;

import hcmute.fit.event_management.entity.UserRole;
import hcmute.fit.event_management.entity.keys.AccountRoleId;
import hcmute.fit.event_management.repository.UserRoleRepository;
import hcmute.fit.event_management.service.UserRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserRoleServiceImpl implements UserRoleService {
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
