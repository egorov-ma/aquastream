package org.aquastream.common.ratelimit.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bucket4j.redis.lettuce.cas.LettuceBasedProxyManager;
import io.lettuce.core.RedisClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.common.ratelimit.filter.RateLimitFilter;
import org.aquastream.common.ratelimit.service.RateLimitService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;

/**
 * Auto-configuration for rate limiting functionality
 */
@Configuration
@EnableConfigurationProperties(RateLimitProperties.class)
@ConditionalOnProperty(name = "aquastream.rate-limit.enabled", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
@Slf4j
public class RateLimitAutoConfiguration {

    private final RateLimitProperties rateLimitProperties;
    private final LettuceConnectionFactory lettuceConnectionFactory;

    /**
     * Configure Bucket4j proxy manager for Redis-based rate limiting
     */
    @Bean
    public LettuceBasedProxyManager<byte[]> lettuceBasedProxyManager() {
        log.info("Configuring Bucket4j Redis proxy manager for rate limiting");
        
        try {
            // Get Redis client from Spring's connection factory
            RedisClient redisClient = (RedisClient) lettuceConnectionFactory.getNativeClient();
            
            return LettuceBasedProxyManager.builderFor(redisClient)
                    .build();
        } catch (Exception e) {
            log.error("Failed to configure Bucket4j Redis proxy manager", e);
            throw new IllegalStateException("Could not initialize rate limiting with Redis", e);
        }
    }

    /**
     * Rate limiting service bean
     */
    @Bean
    public RateLimitService rateLimitService(LettuceBasedProxyManager<byte[]> proxyManager) {
        log.info("Configuring rate limit service with limits: {}", rateLimitProperties.getLimits().keySet());
        return new RateLimitService(rateLimitProperties, proxyManager);
    }

    /**
     * Rate limiting filter bean
     */
    @Bean
    public RateLimitFilter rateLimitFilter(RateLimitService rateLimitService, ObjectMapper objectMapper) {
        return new RateLimitFilter(rateLimitService, objectMapper);
    }

    /**
     * Register the rate limiting filter with high priority
     */
    @Bean
    public FilterRegistrationBean<RateLimitFilter> rateLimitFilterRegistration(RateLimitFilter rateLimitFilter) {
        FilterRegistrationBean<RateLimitFilter> registration = new FilterRegistrationBean<>(rateLimitFilter);
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE + 10); // High priority, but after security filters
        registration.addUrlPatterns("/*"); // Apply to all URLs
        registration.setName("rateLimitFilter");
        
        log.info("Registered rate limiting filter with order: {}", registration.getOrder());
        return registration;
    }
}