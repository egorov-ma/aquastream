package org.aquastream.crew.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "org.aquastream.crew")
@EntityScan(basePackages = "org.aquastream.crew.db.entity")
@EnableJpaRepositories(basePackages = "org.aquastream.crew.db.repository")
public class CrewApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(CrewApiApplication.class, args);
    }
}