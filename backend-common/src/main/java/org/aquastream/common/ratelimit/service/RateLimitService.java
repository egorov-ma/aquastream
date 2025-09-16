package org.aquastream.common.ratelimit.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.ConsumptionProbe;
import io.github.bucket4j.redis.lettuce.cas.LettuceBasedProxyManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.common.ratelimit.config.RateLimitProperties;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.function.Supplier;

/**
 * Service for managing rate limits using Bucket4j
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RateLimitService {

    private final RateLimitProperties rateLimitProperties;
    private final LettuceBasedProxyManager<byte[]> proxyManager;

    /**
     * Cache for bucket configurations to avoid recreating them
     */
    private final ConcurrentMap<String, BucketConfiguration> configurationCache = new ConcurrentHashMap<>();

    /**
     * Check if a request is allowed for the given key and limit type
     *
     * @param key      The unique key for rate limiting (e.g., IP address, user ID)
     * @param limitKey The limit configuration key (e.g., "login", "recovery", "default")
     * @return RateLimitResult containing check result and metadata
     */
    public RateLimitResult checkLimit(String key, String limitKey) {
        return checkLimit(key, limitKey, 1);
    }

    /**
     * Check if a request is allowed for the given key and limit type with custom token consumption
     *
     * @param key         The unique key for rate limiting
     * @param limitKey    The limit configuration key
     * @param tokens      Number of tokens to consume
     * @return RateLimitResult containing check result and metadata
     */
    public RateLimitResult checkLimit(String key, String limitKey, long tokens) {
        if (!rateLimitProperties.isEnabledForKey(limitKey)) {
            log.trace("Rate limiting disabled for key: {}", limitKey);
            return RateLimitResult.allowed();
        }

        try {
            String bucketKey = buildBucketKey(key, limitKey);
            Bucket bucket = getBucket(bucketKey, limitKey);
            
            ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(tokens);
            
            if (probe.isConsumed()) {
                log.trace("Rate limit check passed for key: {} ({}), remaining: {}", 
                        key, limitKey, probe.getRemainingTokens());
                return RateLimitResult.allowed(probe.getRemainingTokens());
            } else {
                long waitTime = probe.getNanosToWaitForRefill() / 1_000_000_000L; // Convert to seconds
                RateLimitProperties.RateLimit limit = rateLimitProperties.getLimit(limitKey);
                long retryAfter = limit.getRetryAfterSeconds() != null ? 
                    limit.getRetryAfterSeconds() : Math.max(1, waitTime);
                
                log.info("Rate limit exceeded for key: {} ({}), retry after: {}s", 
                        key, limitKey, retryAfter);
                return RateLimitResult.rejected(retryAfter, probe.getRemainingTokens());
            }
            
        } catch (Exception e) {
            log.error("Error checking rate limit for key: {} ({})", key, limitKey, e);
            // In case of errors, allow the request (fail-open approach)
            return RateLimitResult.allowed();
        }
    }

    /**
     * Get or create a bucket for the given key and limit type
     */
    private Bucket getBucket(String bucketKey, String limitKey) {
        BucketConfiguration configuration = getBucketConfiguration(limitKey);
        return proxyManager.builder().build(bucketKey.getBytes(), configuration);
    }

    /**
     * Get bucket configuration for the limit type, using cache
     */
    private BucketConfiguration getBucketConfiguration(String limitKey) {
        return configurationCache.computeIfAbsent(limitKey, key -> {
            RateLimitProperties.RateLimit limit = rateLimitProperties.getLimit(key);
            return createBucketConfiguration(limit);
        });
    }

    /**
     * Create bucket configuration from rate limit settings
     */
    private BucketConfiguration createBucketConfiguration(RateLimitProperties.RateLimit limit) {
        Bandwidth bandwidth = Bandwidth.builder()
                .capacity(limit.getCapacity())
                .refillGreedy(limit.getRefillTokens(), limit.getRefillPeriod())
                .build();

        return BucketConfiguration.builder()
                .addLimit(bandwidth)
                .build();
    }

    /**
     * Build a unique bucket key combining user key and limit type
     */
    private String buildBucketKey(String key, String limitKey) {
        return String.format("rate_limit:%s:%s", limitKey, key);
    }

    /**
     * Result of a rate limit check
     */
    public static class RateLimitResult {
        private final boolean allowed;
        private final long retryAfterSeconds;
        private final long remainingTokens;

        private RateLimitResult(boolean allowed, long retryAfterSeconds, long remainingTokens) {
            this.allowed = allowed;
            this.retryAfterSeconds = retryAfterSeconds;
            this.remainingTokens = remainingTokens;
        }

        public static RateLimitResult allowed() {
            return new RateLimitResult(true, 0, -1);
        }

        public static RateLimitResult allowed(long remainingTokens) {
            return new RateLimitResult(true, 0, remainingTokens);
        }

        public static RateLimitResult rejected(long retryAfterSeconds, long remainingTokens) {
            return new RateLimitResult(false, retryAfterSeconds, remainingTokens);
        }

        public boolean isAllowed() {
            return allowed;
        }

        public long getRetryAfterSeconds() {
            return retryAfterSeconds;
        }

        public long getRemainingTokens() {
            return remainingTokens;
        }
    }
}