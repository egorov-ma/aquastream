package org.aquastream.event;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = {
    "org.aquastream.event",
    "org.aquastream.common"
})
@EntityScan(basePackages = "org.aquastream.event.db.entity")
@EnableJpaRepositories(basePackages = "org.aquastream.event.db.repository")
@EnableScheduling
public class EventServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(EventServiceApplication.class, args);
    }
}