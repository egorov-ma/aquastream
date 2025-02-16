package org.aquastream.user.service;

import lombok.RequiredArgsConstructor;
import org.aquastream.common.dto.UserDto;
import org.aquastream.user.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    
    public UserDto findById(Long id) {
        // TODO: Implement user lookup
        return new UserDto();
    }
} 