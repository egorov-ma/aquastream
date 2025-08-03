package org.aquastream.user.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.aquastream.common.domain.user.ERole;
import org.aquastream.user.security.services.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Utility methods for working with JWT tokens.
 * <p>
 * Static token handling and role resolution use
 * {@link org.aquastream.common.domain.user.ERole} from the common domain
 * package rather than the former DTO-based enum.
 */
@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    // Статические токены для тестирования
    private static final String STATIC_TOKEN_ADMIN = "static-token-admin";
    private static final String STATIC_TOKEN_ORGANIZER = "static-token-organizer";
    private static final String STATIC_TOKEN_USER = "static-token-user";
    
    // Мапа для хранения статических токенов
    private static final Map<String, ERole> staticTokens = new HashMap<>();
    
    @Value("${jwt.secret}")
    private String jwtSecret;

    /**
     * Reads the JWT expiration time from the {@code jwt.expiration-ms}
     * configuration property. The previous key {@code jwt.expiration}
     * did not match the property defined in application.yml, which could
     * lead to startup failures if the property was missing.
     */
    @Value("${jwt.expiration-ms}")
    private int jwtExpirationMs;
    
    // Инициализация статических токенов
    {
        staticTokens.put(STATIC_TOKEN_ADMIN, ERole.ROLE_ADMIN);
        staticTokens.put(STATIC_TOKEN_ORGANIZER, ERole.ROLE_ORGANIZER);
        staticTokens.put(STATIC_TOKEN_USER, ERole.ROLE_USER);
    }

    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        return Jwts.builder()
                .subject(userPrincipal.getUsername())
                .issuedAt(new Date())
                .expiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key())
                .compact();
    }
    
    private SecretKey key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    public String getUserNameFromJwtToken(String token) {
        // Проверка на статические токены
        if (staticTokens.containsKey(token)) {
            // Для статических токенов возвращаем имя роли как имя пользователя
            return staticTokens.get(token).name();
        }
        
        return Jwts.parser().verifyWith(key()).build()
                .parseSignedClaims(token).getPayload().getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        // Проверка на статические токены
        if (staticTokens.containsKey(authToken)) {
            return true;
        }
        
        try {
            Jwts.parser().verifyWith(key()).build().parse(authToken);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }

        return false;
    }
    
    /**
     * Возвращает статический токен для заданной роли из
     * {@link org.aquastream.common.domain.user.ERole}.
     *
     * @param role роль пользователя
     * @return статический токен
     */
    public String getStaticTokenForRole(ERole role) {
        switch (role) {
            case ROLE_ADMIN:
                return STATIC_TOKEN_ADMIN;
            case ROLE_ORGANIZER:
                return STATIC_TOKEN_ORGANIZER;
            case ROLE_USER:
                return STATIC_TOKEN_USER;
            default:
                throw new IllegalArgumentException("Неизвестная роль: " + role);
        }
    }
} 