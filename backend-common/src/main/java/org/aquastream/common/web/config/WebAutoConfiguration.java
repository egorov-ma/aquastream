package org.aquastream.common.web.config;

import org.aquastream.common.web.CorrelationIdFilter;
import org.aquastream.common.web.CorrelationIdRestTemplateInterceptor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.client.RestTemplate;

import java.util.List;

/**
 * Auto-configuration for common web components including correlation ID filter and REST template configuration.
 */
@Configuration
public class WebAutoConfiguration {

    /**
     * Registers the CorrelationIdFilter to handle correlation ID processing
     * across all HTTP requests.
     */
    @Bean
    public FilterRegistrationBean<CorrelationIdFilter> correlationIdFilterRegistration() {
        FilterRegistrationBean<CorrelationIdFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new CorrelationIdFilter());
        registration.addUrlPatterns("/*");
        registration.setName("correlationIdFilter");
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE + 1);
        return registration;
    }

    /**
     * Provides a basic RestTemplate configured with correlation ID interceptor for cross-service traceability.
     * This bean is only created if no other RestTemplate bean is defined.
     * Note: The ServiceDiscoveryAutoConfiguration provides a more advanced RestTemplate as @Primary.
     */
    @Bean
    @ConditionalOnMissingBean(name = "serviceAwareRestTemplate")
    public RestTemplate basicRestTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setInterceptors(List.of(new CorrelationIdRestTemplateInterceptor()));
        return restTemplate;
    }

    /**
     * Provides the correlation ID interceptor as a separate bean for manual RestTemplate configuration.
     */
    @Bean
    public CorrelationIdRestTemplateInterceptor correlationIdRestTemplateInterceptor() {
        return new CorrelationIdRestTemplateInterceptor();
    }
}