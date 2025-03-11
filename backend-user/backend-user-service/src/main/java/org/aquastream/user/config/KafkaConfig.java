package org.aquastream.user.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {
    
    @Value("${spring.kafka.topics.user-registration}")
    private String userRegistrationTopic;
    
    @Bean
    public NewTopic userRegistrationTopic() {
        return TopicBuilder.name(userRegistrationTopic)
                .partitions(1)
                .replicas(1)
                .build();
    }
} 