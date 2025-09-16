package org.aquastream.common.metrics.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Auto-configuration for metrics collection system
 */
@Configuration
@EnableConfigurationProperties(MetricsProperties.class)
@ComponentScan(basePackages = "org.aquastream.common.metrics")
@EnableScheduling
@ConditionalOnProperty(name = "aquastream.metrics.enabled", havingValue = "true", matchIfMissing = true)
@Slf4j
public class MetricsAutoConfiguration {

    @Bean
    public RedisTemplate<String, String> metricsRedisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        
        // Use String serializer for both keys and values
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setValueSerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        template.setHashValueSerializer(stringSerializer);
        
        template.afterPropertiesSet();
        
        log.info("Configured Redis template for metrics");
        return template;
    }

    @Bean
    public ObjectMapper metricsObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        return mapper;
    }
}