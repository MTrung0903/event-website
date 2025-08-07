package hcmute.fit.event_management.service.Impl;

import hcmute.fit.event_management.dto.UserDetail;
import hcmute.fit.event_management.entity.User;


import hcmute.fit.event_management.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserDetailService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));


        if (user.getListUserRoles() == null || user.getListUserRoles().isEmpty()) {
            System.out.println("User has no roles");
        }

        List<GrantedAuthority> authorities = user.getListUserRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getRole().getName()))
                .collect(Collectors.toList());
        List<GrantedAuthority> permissionAuthorities = user.getListUserRoles().stream()
                .flatMap(userRole -> userRole.getRole().getPermissions().stream())
                .map(permission -> new SimpleGrantedAuthority(permission.getName()))
                .distinct()
                .collect(Collectors.toList());
        authorities.addAll(permissionAuthorities);
        System.out.println("Authorities: " + authorities);
        return new UserDetail(user.getEmail(), user.getPassword(), authorities);
    }
}
