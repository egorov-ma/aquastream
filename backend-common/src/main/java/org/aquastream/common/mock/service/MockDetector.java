package org.aquastream.common.mock.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.common.mock.config.MockProperties;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Arrays;

/**
 * Service to detect if mocks should be used based on profile and headers
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MockDetector {

    private final MockProperties mockProperties;
    private final Environment environment;

    /**
     * Check if mocks should be enabled for current request/context
     */
    public boolean shouldUseMocks() {
        // First check global configuration
        boolean globallyEnabled = mockProperties.isEnabled();
        
        // Check if we're in a dev profile
        boolean isDevProfile = isAllowedProfile();
        
        // Check for header override
        boolean headerOverride = checkHeaderOverride();
        
        boolean result = globallyEnabled || (isDevProfile && headerOverride);
        
        log.trace("Mock detection: globally={}, devProfile={}, headerOverride={}, result={}", 
                globallyEnabled, isDevProfile, headerOverride, result);
                
        return result;
    }

    /**
     * Check if current profile allows mock override
     */
    public boolean isAllowedProfile() {
        String[] activeProfiles = environment.getActiveProfiles();
        String[] allowedProfiles = mockProperties.getAllowedProfiles();
        
        return Arrays.stream(activeProfiles)
                .anyMatch(profile -> Arrays.asList(allowedProfiles).contains(profile));
    }

    /**
     * Check for mock override header in current request
     */
    public boolean checkHeaderOverride() {
        if (!mockProperties.isHeaderOverrideEnabled()) {
            return false;
        }

        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) {
                return false;
            }

            HttpServletRequest request = attrs.getRequest();
            String headerValue = request.getHeader(mockProperties.getHeaderName());
            
            boolean override = "true".equalsIgnoreCase(headerValue) || "1".equals(headerValue);
            
            if (override) {
                log.debug("Mock override detected via header {}: {}", 
                        mockProperties.getHeaderName(), headerValue);
            }
            
            return override;
            
        } catch (Exception e) {
            log.debug("Could not check header override: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get current active profiles as string
     */
    public String getActiveProfiles() {
        return String.join(",", environment.getActiveProfiles());
    }

    /**
     * Check if specific mock type should be enabled
     */
    public boolean shouldUseMock(String mockType) {
        boolean generalMock = shouldUseMocks();
        
        // Check for specific mock type configuration
        String propertyKey = "app.mocks." + mockType + ".enabled";
        Boolean specificConfig = environment.getProperty(propertyKey, Boolean.class);
        
        if (specificConfig != null) {
            return specificConfig && isAllowedProfile();
        }
        
        return generalMock;
    }

    /**
     * Get mock configuration summary for debugging
     */
    public MockStatus getMockStatus() {
        return MockStatus.builder()
                .mocksEnabled(shouldUseMocks())
                .globallyEnabled(mockProperties.isEnabled())
                .allowedProfile(isAllowedProfile())
                .headerOverride(checkHeaderOverride())
                .activeProfiles(getActiveProfiles())
                .headerName(mockProperties.getHeaderName())
                .build();
    }

    @lombok.Data
    @lombok.Builder
    public static class MockStatus {
        private boolean mocksEnabled;
        private boolean globallyEnabled;
        private boolean allowedProfile;
        private boolean headerOverride;
        private String activeProfiles;
        private String headerName;
    }
}