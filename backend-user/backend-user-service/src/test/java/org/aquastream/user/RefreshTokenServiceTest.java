package org.aquastream.user;

import org.aquastream.user.entity.RefreshToken;
import org.aquastream.user.service.RefreshTokenService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;

class RefreshTokenServiceTest {

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void verifyExpirationThrowsWhenExpired() {
        RefreshToken token = new RefreshToken();
        token.setExpiryDate(LocalDateTime.now().minusDays(1));
        Assertions.assertThrows(RuntimeException.class, () -> refreshTokenService.verifyExpiration(token));
    }
}