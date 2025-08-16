package org.aquastream.event.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "org.aquastream.event")
@EntityScan(basePackages = "org.aquastream.event.db.entity")
@EnableJpaRepositories(basePackages = "org.aquastream.event.db.repository")
public class EventApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(EventApiApplication.class, args);
    }
}