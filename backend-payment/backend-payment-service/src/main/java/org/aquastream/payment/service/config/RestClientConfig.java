package org.aquastream.payment.service.config;

import org.aquastream.common.web.CorrelationIdRestTemplateInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.util.List;

/**
 * Configuration for REST client components
 */
@Configuration
public class RestClientConfig {
    
    @Bean
    public RestTemplate restTemplate(CorrelationIdRestTemplateInterceptor correlationIdInterceptor) {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setInterceptors(List.of(correlationIdInterceptor));
        return restTemplate;
    }
}