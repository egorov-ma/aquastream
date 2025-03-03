package org.aquastream.user.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.user.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserEventProducer {
    private final KafkaTemplate<String, UserRegistrationEvent> kafkaTemplate;
    
    @Value("${spring.kafka.topics.user-registration}")
    private String userRegistrationTopic;
    
    public void sendUserRegistrationEvent(User user) {
        UserRegistrationEvent event = UserRegistrationEvent.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .telegramUser(user.getTelegramUser())
                .build();
        
        log.info("Sending user registration event for user: {}", user.getUsername());
        
        try {
            kafkaTemplate.send(userRegistrationTopic, event);
        } catch (Exception e) {
            log.error("Error sending user registration event: {}", e.getMessage(), e);
        }
    }
} 