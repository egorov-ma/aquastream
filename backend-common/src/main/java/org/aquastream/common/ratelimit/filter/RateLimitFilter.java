package org.aquastream.common.ratelimit.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.common.ratelimit.service.RateLimitService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.URI;
import java.time.Instant;
import java.util.regex.Pattern;

/**
 * Filter to apply rate limiting to HTTP requests
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;
    private final ObjectMapper objectMapper;

    // Patterns for different endpoint types
    private static final Pattern LOGIN_PATTERN = Pattern.compile(".*/(login|auth|signin).*");
    private static final Pattern RECOVERY_PATTERN = Pattern.compile(".*/(recovery|reset|forgot).*");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {

        // Skip rate limiting for certain paths (health checks, static resources)
        if (shouldSkipRateLimit(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientKey = getClientKey(request);
        String limitKey = determineLimitKey(request);

        RateLimitService.RateLimitResult result = rateLimitService.checkLimit(clientKey, limitKey);

        if (result.isAllowed()) {
            // Add rate limit headers to successful responses
            addRateLimitHeaders(response, result);
            filterChain.doFilter(request, response);
        } else {
            // Return 429 Too Many Requests with RFC 7807 Problem Details
            handleRateLimitExceeded(request, response, result, limitKey);
        }
    }

    /**
     * Determine if rate limiting should be skipped for this request
     */
    private boolean shouldSkipRateLimit(HttpServletRequest request) {
        String path = request.getRequestURI();
        
        // Skip for health checks and monitoring endpoints
        if (path.startsWith("/actuator/") || 
            path.startsWith("/health") || 
            path.startsWith("/metrics") ||
            path.startsWith("/static/") ||
            path.startsWith("/css/") ||
            path.startsWith("/js/") ||
            path.startsWith("/images/")) {
            return true;
        }

        // Skip for OPTIONS requests (CORS preflight)
        return "OPTIONS".equals(request.getMethod());
    }

    /**
     * Extract client key for rate limiting (IP address with optional user context)
     */
    private String getClientKey(HttpServletRequest request) {
        // Try to get real IP from headers (in case of proxy/load balancer)
        String clientIp = getClientIpAddress(request);
        
        // For authenticated requests, we could also use user ID
        // This would require integration with authentication system
        // String userId = extractUserId(request);
        // return userId != null ? "user:" + userId : "ip:" + clientIp;
        
        return "ip:" + clientIp;
    }

    /**
     * Get client IP address, considering proxy headers
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    /**
     * Determine the appropriate rate limit key based on the request
     */
    private String determineLimitKey(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // Check for login-related endpoints
        if (LOGIN_PATTERN.matcher(path).matches()) {
            return "login";
        }

        // Check for password recovery endpoints
        if (RECOVERY_PATTERN.matcher(path).matches()) {
            return "recovery";
        }

        // Default rate limit for all other endpoints
        return "default";
    }

    /**
     * Add rate limit information headers to the response
     */
    private void addRateLimitHeaders(HttpServletResponse response, RateLimitService.RateLimitResult result) {
        if (result.getRemainingTokens() >= 0) {
            response.setHeader("X-RateLimit-Remaining", String.valueOf(result.getRemainingTokens()));
        }
    }

    /**
     * Handle rate limit exceeded - return 429 with RFC 7807 Problem Details
     */
    private void handleRateLimitExceeded(HttpServletRequest request, HttpServletResponse response,
                                       RateLimitService.RateLimitResult result, String limitKey) 
            throws IOException {

        // Set response status and headers
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        response.setHeader("Retry-After", String.valueOf(result.getRetryAfterSeconds()));
        
        if (result.getRemainingTokens() >= 0) {
            response.setHeader("X-RateLimit-Remaining", "0");
        }

        // Create RFC 7807 Problem Details response
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
            HttpStatus.TOO_MANY_REQUESTS,
            String.format("Rate limit exceeded for %s requests. Please retry after %d seconds.",
                limitKey, result.getRetryAfterSeconds())
        );
        
        problemDetail.setTitle("Too Many Requests");
        problemDetail.setType(URI.create("https://aquastream.org/problems/rate-limit-exceeded"));
        problemDetail.setProperty("limitType", limitKey);
        problemDetail.setProperty("retryAfter", result.getRetryAfterSeconds());
        problemDetail.setProperty("timestamp", Instant.now());
        
        // Log the rate limit violation
        String clientKey = getClientKey(request);
        log.warn("Rate limit exceeded - Client: {}, Endpoint: {} {}, Limit: {}, Retry after: {}s",
            clientKey, request.getMethod(), request.getRequestURI(), limitKey, result.getRetryAfterSeconds());

        // Write JSON response
        objectMapper.writeValue(response.getOutputStream(), problemDetail);
    }
}