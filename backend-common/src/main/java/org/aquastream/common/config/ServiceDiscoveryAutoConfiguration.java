package org.aquastream.common.config;

import org.aquastream.common.web.CorrelationIdRestTemplateInterceptor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.util.List;

/**
 * Auto-configuration for service discovery and inter-service communication.
 * Provides RestTemplate configurations with proper timeouts and interceptors.
 */
@Configuration
@EnableConfigurationProperties(ServiceUrls.class)
public class ServiceDiscoveryAutoConfiguration {

    /**
     * Primary RestTemplate with service discovery configuration and correlation ID support.
     * This bean will be used by default when autowiring RestTemplate.
     */
    @Bean
    @Primary
    public RestTemplate serviceAwareRestTemplate(ServiceUrls serviceUrls, 
                                                  CorrelationIdRestTemplateInterceptor correlationIdInterceptor) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        
        // Use connection timeout from the first service configuration as default
        // Individual services can override this by creating their own RestTemplate
        ServiceUrls.ServiceConfig defaultConfig = serviceUrls.getUser();
        factory.setConnectTimeout(defaultConfig.getConnectionTimeout());
        factory.setReadTimeout(defaultConfig.getReadTimeout());
        
        RestTemplate restTemplate = new RestTemplate(factory);
        restTemplate.setInterceptors(List.of(correlationIdInterceptor));
        
        return restTemplate;
    }

    /**
     * RestTemplate specifically configured for user service calls
     */
    @Bean("userServiceRestTemplate")
    public RestTemplate userServiceRestTemplate(ServiceUrls serviceUrls,
                                                CorrelationIdRestTemplateInterceptor correlationIdInterceptor) {
        return createServiceRestTemplate(serviceUrls.getUser(), correlationIdInterceptor);
    }

    /**
     * RestTemplate specifically configured for event service calls
     */
    @Bean("eventServiceRestTemplate")
    public RestTemplate eventServiceRestTemplate(ServiceUrls serviceUrls,
                                                 CorrelationIdRestTemplateInterceptor correlationIdInterceptor) {
        return createServiceRestTemplate(serviceUrls.getEvent(), correlationIdInterceptor);
    }

    /**
     * RestTemplate specifically configured for payment service calls
     */
    @Bean("paymentServiceRestTemplate")
    public RestTemplate paymentServiceRestTemplate(ServiceUrls serviceUrls,
                                                   CorrelationIdRestTemplateInterceptor correlationIdInterceptor) {
        return createServiceRestTemplate(serviceUrls.getPayment(), correlationIdInterceptor);
    }

    /**
     * RestTemplate specifically configured for notification service calls
     */
    @Bean("notificationServiceRestTemplate")
    public RestTemplate notificationServiceRestTemplate(ServiceUrls serviceUrls,
                                                        CorrelationIdRestTemplateInterceptor correlationIdInterceptor) {
        return createServiceRestTemplate(serviceUrls.getNotification(), correlationIdInterceptor);
    }

    /**
     * RestTemplate specifically configured for crew service calls
     */
    @Bean("crewServiceRestTemplate")
    public RestTemplate crewServiceRestTemplate(ServiceUrls serviceUrls,
                                                CorrelationIdRestTemplateInterceptor correlationIdInterceptor) {
        return createServiceRestTemplate(serviceUrls.getCrew(), correlationIdInterceptor);
    }

    /**
     * RestTemplate specifically configured for media service calls
     */
    @Bean("mediaServiceRestTemplate")
    public RestTemplate mediaServiceRestTemplate(ServiceUrls serviceUrls,
                                                 CorrelationIdRestTemplateInterceptor correlationIdInterceptor) {
        return createServiceRestTemplate(serviceUrls.getMedia(), correlationIdInterceptor);
    }

    /**
     * Helper method to create a RestTemplate with specific service configuration
     */
    private RestTemplate createServiceRestTemplate(ServiceUrls.ServiceConfig config,
                                                   CorrelationIdRestTemplateInterceptor correlationIdInterceptor) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(config.getConnectionTimeout());
        factory.setReadTimeout(config.getReadTimeout());
        
        RestTemplate restTemplate = new RestTemplate(factory);
        restTemplate.setInterceptors(List.of(correlationIdInterceptor));
        
        return restTemplate;
    }
}