package com.dashboard.service;

import com.dashboard.dto.request.LoginRequest;
import com.dashboard.dto.response.AuthResponse;
import com.dashboard.model.User;
import com.dashboard.repository.UserRepository;
import com.dashboard.security.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse login(LoginRequest request) {
        // Throws BadCredentialsException if invalid — handled by GlobalExceptionHandler
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String token = jwtService.generateToken(user);

        return new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole());
    }
}
