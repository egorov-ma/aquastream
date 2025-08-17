package org.aquastream.media.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "org.aquastream")
@EntityScan(basePackages = "org.aquastream.media.db.entity")
@EnableJpaRepositories(basePackages = "org.aquastream.media.db.repository")
@EnableScheduling
public class MediaApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(MediaApiApplication.class, args);
    }
}