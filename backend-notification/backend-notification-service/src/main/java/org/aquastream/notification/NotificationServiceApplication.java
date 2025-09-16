package org.aquastream.notification;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication(scanBasePackages = {
    "org.aquastream.notification",
    "org.aquastream.common"
})
@EntityScan(basePackages = "org.aquastream.notification.db.entity")
@EnableJpaRepositories(basePackages = "org.aquastream.notification.db.repository")
@EnableAsync
public class NotificationServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(NotificationServiceApplication.class, args);
    }
}