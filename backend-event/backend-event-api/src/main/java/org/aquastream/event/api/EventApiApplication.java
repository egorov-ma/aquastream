package org.aquastream.event.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "org.aquastream.event")
@EntityScan(basePackages = "org.aquastream.event.db.entity")
@EnableJpaRepositories(basePackages = "org.aquastream.event.db.repository")
@EnableScheduling
@EnableAsync
public class EventApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(EventApiApplication.class, args);
    }
}